import { Inject, Injectable } from '@nestjs/common';
import { GeneratePresignedUrlInput } from '../dtos/inputs/generate-presigned-url.input';
import { PresignedUrlStrategy } from '../interfaces/presigned-url.strategy';
import { UploaderS3Strategy } from '../strategies/s3/s3.strategy';
import { ValidationOptions } from '../options/validation.options';
import { generateFileName } from '../utilities/generate-file-name.utility';
import { InjectAppRepository } from 'src/common/decorators/inject-app-repository.decorator';
import { AppRepository } from '../../app-database/repositories/app.repository';
import { File } from '../entities/file.entity';
import { UploaderValidationService } from './file-validation.service';
@Injectable()
export class PresignedUrlService {
  constructor(
    private readonly uploaderValidationService: UploaderValidationService,
    @Inject(UploaderS3Strategy)
    private readonly preSignedUrlStrategy: PresignedUrlStrategy,
    @InjectAppRepository(File)
    private readonly fileRepository: AppRepository<File>,
  ) {}

  async getUploadPresignedUrl(input: GeneratePresignedUrlInput) {
    this.uploaderValidationService.useCaseValidator({
      model: input.fileModel,
      use_case: input.fileUseCase,
    });

    const validationOptions = ValidationOptions[input.fileUseCase];

    if (
      !validationOptions.acceptedFormats.includes(input.mimeType) ||
      input.sizeInBytes > validationOptions.maxSizeInBytes
    ) {
      throw validationOptions.error;
    }

    const fileName = generateFileName(input.fileUseCase, input.fileName);

    const file = await this.fileRepository.createOne({
      ...input,
      uploaded: false,
      fileName,
    });

    const presignedUrl = await this.preSignedUrlStrategy.getUploadPresignedUrl(
      fileName,
      input.fileModel,
      input.mimeType,
      input.sizeInBytes,
      file.id,
    );

    return {
      presignedUrl,
      file,
    };
  }

  async getDownloadPresignedUrl(file: File) {
    const url = await this.preSignedUrlStrategy.getDownloadPresignedUrl(
      file.fileModel,
      file.fileName,
    );

    return url;
  }
}
