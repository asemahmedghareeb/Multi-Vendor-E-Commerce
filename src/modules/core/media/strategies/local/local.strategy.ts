import { Injectable, Logger } from '@nestjs/common';
import * as path from 'path';
import { UploadFileInput } from '../../dtos/inputs/upload-file.input';
import * as Busboy from 'busboy';
import * as fs from 'fs';
import * as mime from 'mime-types';
import { LocalFileResource } from '../../types/local-file-resource.type';
import { Request, Response } from 'express';
import { ValidationOptions } from '../../options/validation.options';
import { Readable } from 'stream';
import { v4 as uuidv4 } from 'uuid';
import { AppHttpException } from 'src/common/exceptions/app-http.exception';
import { ErrorCodeEnum } from 'src/common/enums/error-code.enum';
import { once } from 'events';
import { FileModelEnum } from '../../enums/file-model.enum';
import { UploaderStrategy } from '../../interfaces/uploader.strategy';
import { FileToDelete } from '../../types/file-to-delete.type';
import { generateFileName } from '../../utilities/generate-file-name.utility';

const BASE_UPLOAD_DIR = path.resolve(
  __dirname,
  '..',
  '..',
  '..',
  '..',
  '..',
  '..',
  'storage',
);

@Injectable()
export class UploaderLocalStrategy implements UploaderStrategy {
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
    const fileRecourses: LocalFileResource[] = [];

    const dir = path.resolve(BASE_UPLOAD_DIR, fileInput.model);

    const validationOptions = ValidationOptions[fileInput.use_case];

    fs.mkdirSync(dir, { recursive: true });

    let finalCallBack: () => Promise<any> = async () => {};

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

        const filePath = path.join(dir, saveName);

        let sizeInBytes = 0;
        finalCallBack = async () => {
          await callBack(metadata, sizeInBytes, saveName);
        };

        const writeStream = fs.createWriteStream(filePath);

        fileRecourses.push({
          filePath,
          readStream,
          writeStream,
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

        writeStream.on('error', (err) => {
          busboy.emit('error', err);
        });

        readStream.pipe(writeStream);
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

    busboy.on('first_chunk_validated', () => {
      // add extra logic if needed
    });

    req.on('aborted', () => {
      if (fileReceived) this.cancelFileUpload(fileRecourses);
    });

    const uploadedSuccessfully = Promise.all([
      once(busboy, 'first_chunk_validated'),
      once(busboy, 'finish'),
    ]);

    req.pipe(busboy);

    await uploadedSuccessfully;

    await finalCallBack();
  }

  cancelFileUpload(fileResources: LocalFileResource[]): void {
    for (const item of fileResources) {
      try {
        item.readStream.unpipe();
        item.writeStream.destroy();
        item.readStream.destroy();
        fs.rmSync(item.filePath, { force: true });
      } catch (err) {
        Logger.error(err);
      }
    }
  }

  streamFile(model: FileModelEnum, filename: string, res: Response) {
    const filePath = path.join(BASE_UPLOAD_DIR, model, filename);
    if (!fs.existsSync(filePath)) {
      throw new AppHttpException(ErrorCodeEnum.NOT_FOUND);
    }

    const mimeType = mime.lookup(filePath) || 'application/octet-stream';

    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Length', fs.statSync(filePath).size);

    const fileStream = fs.createReadStream(filePath);

    fileStream.pipe(res);
  }

  deleteFiles(filesToDelete: FileToDelete[]): any {
    for (const item of filesToDelete) {
      try {
        fs.rmSync(path.join(BASE_UPLOAD_DIR, item.model, item.filename), {
          force: true,
        });
      } catch (err) {
        Logger.error(err);
      }
    }
  }
}
