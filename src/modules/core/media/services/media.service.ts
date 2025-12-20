import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectAppRepository } from 'src/common/decorators/inject-app-repository.decorator';
import { AppRepository } from '../../app-database/repositories/app.repository';
import { File } from '../entities/file.entity';
import { UploaderStrategy } from '../interfaces/uploader.strategy';
import { UploaderValidationService } from './file-validation.service';
import { plainToInstance } from 'class-transformer';
import { UploadFileInput } from '../dtos/inputs/upload-file.input';
import { Request, Response } from 'express';
import { validateOrReject } from 'class-validator';
import * as Busboy from 'busboy';
import { FileModelEnum } from '../enums/file-model.enum';
import { LessThan } from 'typeorm';
import { validationPipeExceptionFactory } from 'src/common/utilities/validation-pipe-exception.factory';
import { AppHttpException } from 'src/common/exceptions/app-http.exception';
import { ErrorCodeEnum } from 'src/common/enums/error-code.enum';
import { StreamFileInput } from '../dtos/inputs/stream-file.input';
import { UploaderLocalStrategy } from '../strategies/local/local.strategy';
// import { UploaderS3Strategy } from '../strategies/s3/s3.strategy';
import { MarkFileAsUploadedInput } from '../dtos/inputs/mark-file-as-uploaded.input';

@Injectable()
export class MediaService {
  constructor(
    @InjectAppRepository(File)
    private readonly fileRepository: AppRepository<File>,
    // @Inject(UploaderS3Strategy)
    @Inject(UploaderLocalStrategy)
    private readonly uploaderStrategy: UploaderStrategy,
    private readonly uploaderValidationService: UploaderValidationService,
  ) {}

  async uploadFile(req: Request) {
    if (!req.headers['content-type'])
      throw new AppHttpException(ErrorCodeEnum.MISSING_CONTENT_TYPE);

    const fileInput = plainToInstance(UploadFileInput, {
      use_case: req.headers.use_case,
      model: req.headers.model,
    });

    try {
      await validateOrReject(fileInput);
    } catch (errors) {
      throw validationPipeExceptionFactory(errors);
    }

    this.uploaderValidationService.useCaseValidator(fileInput);

    try {
      let savedFile: File | undefined;

      await this.uploaderStrategy.uploadFile(
        req,
        fileInput,
        this.uploaderValidationService.onFirstChunkValidator,
        async (
          metadata: Busboy.FileInfo,
          sizeInBytes: number,
          fileName: string,
        ) => {
          const file = this.fileRepository.create({
            fileModel: fileInput.model,
            fileUseCase: fileInput.use_case,
            sizeInBytes,
            fileName,
            mimeType: metadata.mimeType,
          });
          savedFile = await this.fileRepository.save(file);
        },
      );

      return {
        file: {
          ...savedFile,
          url: savedFile?.url,
          createdAt: savedFile?.createdAt.getTime(),
          updatedAt: savedFile?.updatedAt.getTime(),
          deletedAt: savedFile?.deletedAt?.getTime(),
        },
      };
    } catch (err) {
      Logger.error(err);
      throw err;
    }
  }

  async streamFile(model: FileModelEnum, filename: string, res: Response) {
    const streamFileInput = plainToInstance(StreamFileInput, {
      filename,
      model,
    });

    try {
      await validateOrReject(streamFileInput);
    } catch (errors) {
      throw validationPipeExceptionFactory(errors);
    }

    await this.uploaderStrategy.streamFile(model, filename, res);
  }

  async removeUnReferencedFiles() {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

    const unreferencedFiles = await this.fileRepository.find({
      where: {
        hasReference: false,
        createdAt: LessThan(twoHoursAgo),
      },
    });

    if (!unreferencedFiles.length) return;

    this.uploaderStrategy.deleteFiles(
      unreferencedFiles.map((item) => {
        return {
          model: item.fileModel,
          filename: item.fileName,
        };
      }),
    );

    await this.fileRepository.remove(unreferencedFiles);
  }

  async markFileAsUploaded(input: MarkFileAsUploadedInput) {
    const file = await this.fileRepository.findOneOrFail(
      {
        where: {
          id: input.fileId,
        },
      },
      ErrorCodeEnum.FILE_DOES_NOT_EXIST,
    );

    await this.fileRepository.updateOneFromExistingModel(file, {
      uploaded: true,
    });

    return true;
  }
}
