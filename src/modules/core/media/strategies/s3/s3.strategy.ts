import { Injectable, Logger } from '@nestjs/common';
import { UploadFileInput } from '../../dtos/inputs/upload-file.input';
import * as Busboy from 'busboy';
import * as mime from 'mime-types';
import { Request, Response } from 'express';
import { ValidationOptions } from '../../options/validation.options';
import { PassThrough, Readable } from 'stream';
import { AppHttpException } from 'src/common/exceptions/app-http.exception';
import { ErrorCodeEnum } from 'src/common/enums/error-code.enum';
import { once } from 'events';
import { FileModelEnum } from '../../enums/file-model.enum';
import { UploaderStrategy } from '../../interfaces/uploader.strategy';
import { FileToDelete } from '../../types/file-to-delete.type';
import { generateFileName } from '../../utilities/generate-file-name.utility';
import { ConfigService } from '@nestjs/config';
import {
  DeleteObjectsCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ObjectIdentifier,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { S3FileResource } from '../../types/s3-file-resource.type';
import { PresignedUrlStrategy } from '../../interfaces/presigned-url.strategy';
import { FileTypeEnum } from '../../enums/file-type.enum';

import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { getSignedUrl as getCloudFrontSignedUrl } from '@aws-sdk/cloudfront-signer';

@Injectable()
export class UploaderS3Strategy
  implements UploaderStrategy, PresignedUrlStrategy
{
  private s3Client: S3Client;
  private bucketName: string;
  private cloudFrontUrl: string;
  private cloudFrontKeyPairId: string;
  private cloudFrontPrivateKey: string;

  constructor(private readonly configService: ConfigService) {
    this.s3Client = new S3Client({
      region: this.configService.getOrThrow('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.getOrThrow('AWS_ACCESS_KEY'),
        secretAccessKey: this.configService.getOrThrow('AWS_SECRET_ACCESS_KEY'),
      },
    });
    this.bucketName = this.configService.getOrThrow('AWS_S3_BUCKET');
    this.cloudFrontUrl = this.configService.getOrThrow('CLOUD_FRONT_URL');
    this.cloudFrontKeyPairId = this.configService.getOrThrow(
      'CLOUD_FRONT_PAIR_ID',
    );
    this.cloudFrontPrivateKey = this.configService.getOrThrow(
      'CLOUD_FRONT_PRIVATE_KEY',
    );
  }

  async uploadFile(
    req: Request,
    fileInput: UploadFileInput,
    onFirstChunkValidator: (
      fileInput: UploadFileInput,
      metadata: Busboy.FileInfo,
      chunk: Buffer,
    ) => Promise<void>,
    callBack: (
      metadata: Busboy.FileInfo,
      sizeInBytes: number,
      saveName: string,
    ) => Promise<void>,
  ): Promise<any> {
    const fileRecourses: S3FileResource[] = [];

    const validationOptions = ValidationOptions[fileInput.use_case];
    let finalCallBack: () => Promise<any> = async () => {};
    let uploadPromise: Promise<any> | null = null;
    let fileReceived = false;

    const busboy = Busboy({
      headers: req.headers,
      limits: {
        files: 1,
        fields: 0,
        fileSize: validationOptions.maxSizeInBytes,
      },
    });

    busboy.on(
      'file',
      (_fieldname: string, readStream: Readable, metadata: Busboy.FileInfo) => {
        const saveName = generateFileName(
          fileInput.use_case,
          metadata.filename,
        );
        fileReceived = true;

        let sizeInBytes = 0;
        finalCallBack = async () => {
          await callBack(metadata, sizeInBytes, saveName);
        };

        const passThrough = new PassThrough();
        uploadPromise = new Upload({
          client: this.s3Client,
          params: {
            Bucket: this.bucketName,
            Key: `${fileInput.model}/${saveName}`,
            Body: passThrough,
            ContentType: metadata.mimeType,
          },
        }).done();

        fileRecourses.push({
          key: `${fileInput.model}/${saveName}`,
          passThrough,
          readStream,
        });

        let isFirstChunk = true;

        readStream.on('data', (chunk: Buffer) => {
          sizeInBytes += chunk.length;
          if (isFirstChunk) {
            onFirstChunkValidator(fileInput, metadata, chunk)
              .then(() => {
                busboy.emit('first_chunk_validated');
              })
              .catch((err) => {
                readStream.emit('error', err);
              });
          }
          isFirstChunk = false;
        });

        readStream.on('limit', () => {
          readStream.emit('error', validationOptions.error);
        });

        readStream.on('error', (err) => {
          busboy.emit('error', err);
        });

        readStream.pipe(passThrough);
      },
    );

    busboy.on('filesLimit', () => {
      busboy.emit('error', new AppHttpException(ErrorCodeEnum.TOO_MANY_FILES));
    });

    busboy.on('fieldsLimit', () => {
      busboy.emit('error', new AppHttpException(ErrorCodeEnum.TOO_MANY_FIELDS));
    });

    busboy.on('error', (err) => {
      if (fileReceived) this.cancelFileUpload(fileRecourses);
    });

    busboy.on('finish', () => {
      if (!fileReceived) {
        busboy.emit(
          'error',
          new AppHttpException(ErrorCodeEnum.NO_FILE_PROVIDED),
        );
      }
    });

    busboy.on('first_chunk_validated', () => {});

    req.on('aborted', () => {
      if (fileReceived) this.cancelFileUpload(fileRecourses);
    });

    const uploadedSuccessfully = Promise.all([
      once(busboy, 'first_chunk_validated'),
      once(busboy, 'finish'),
    ]);

    req.pipe(busboy);

    await uploadedSuccessfully;

    await uploadPromise;

    await finalCallBack();
  }

  async cancelFileUpload(fileResources: S3FileResource[]): Promise<void> {
    const fileKeys: ObjectIdentifier[] = [];
    for (const item of fileResources) {
      try {
        item.readStream.removeAllListeners();
        item.passThrough.removeAllListeners();
        item.readStream.unpipe();
        item.passThrough.unpipe();
        item.readStream.destroy();
        item.passThrough.destroy();
        fileKeys.push({ Key: item.key });
      } catch (err) {
        Logger.error(err);
      }
    }
    try {
      await this.s3Client.send(
        new DeleteObjectsCommand({
          Bucket: this.bucketName,
          Delete: {
            Objects: fileKeys,
          },
        }),
      );
    } catch (err) {
      Logger.error(err);
    }
  }

  async streamFile(model: FileModelEnum, filename: string, res: Response) {
    const key = `${model}/${filename}`;

    try {
      const head = await this.s3Client.send(
        new HeadObjectCommand({
          Bucket: this.bucketName,
          Key: key,
        }),
      );

      const mimeType = mime.lookup(filename) || 'application/octet-stream';
      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Length', head.ContentLength ?? 0);
      res.setHeader('Content-Disposition', `inline; filename="${filename}"`);

      const getObjectCommand = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });
      const { Body } = await this.s3Client.send(getObjectCommand);

      if (!(Body instanceof Readable)) {
        throw new Error('Invalid S3 Body stream.');
      }

      Body.pipe(res).on('error', (err) => {
        Logger.error(err);
        res.status(500).end('Error streaming file.');
      });
    } catch (err: any) {
      if (err?.$metadata?.httpStatusCode === 404 || err.name === 'NotFound') {
        throw new AppHttpException(ErrorCodeEnum.NOT_FOUND);
      }
      throw new AppHttpException(ErrorCodeEnum.SERVER_SIDE_ERROR);
    }
  }

  async deleteFiles(filesToDelete: FileToDelete[]): Promise<void> {
    await this.s3Client.send(
      new DeleteObjectsCommand({
        Bucket: this.bucketName,
        Delete: {
          Objects: filesToDelete.map((fileItem) => ({
            Key: `${fileItem.model}/${fileItem.filename}`,
          })),
        },
      }),
    );
  }

  async getUploadPresignedUrl(
    fileName: string,
    fileModel: string,
    mimeType: FileTypeEnum,
    sizeInBytes: number,
    fileId: string,
  ): Promise<string> {
    const metadata = {
      mimeType,
      sizeInBytes,
    };

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: `${fileModel}/${fileName}`,
      Metadata: { validator: JSON.stringify(metadata), fileId },
      ContentType: mimeType,
    });

    const signedUrl = await getSignedUrl(this.s3Client, command, {
      expiresIn: 60 * 60,
    });

    return signedUrl;
  }

  async getDownloadPresignedUrl(
    fileModel: string,
    fileName: string,
  ): Promise<string> {
    const filePath = `${fileModel}/${fileName}`;
    const fullUrl = `https://${this.cloudFrontUrl}/${filePath}`;

    const signedUrl = getCloudFrontSignedUrl({
      url: fullUrl,
      keyPairId: this.cloudFrontKeyPairId,
      privateKey: this.cloudFrontPrivateKey,
      dateLessThan: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // expires in 1 min
    });
    return signedUrl;
  }
}
