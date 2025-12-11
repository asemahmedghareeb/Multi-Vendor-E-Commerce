import { Injectable } from '@nestjs/common';
import { FileModelUseCaseValidatorOptions } from '../options/file-model-use-case-validator.options';
import { FileValidationOptions } from '../types/file-validation-options.type';
import { FileTypeEnum } from '../enums/file-type.enum';
import * as Busboy from 'busboy';
import { fileTypeFromBuffer } from 'file-type';
import { UploadFileInput } from '../dtos/inputs/upload-file.input';
import { ValidationOptions } from '../options/validation.options';
import { AppHttpException } from 'src/common/exceptions/app-http.exception';
import { ErrorCodeEnum } from 'src/common/enums/error-code.enum';

@Injectable()
export class UploaderValidationService {
  useCaseValidator(fileInput: UploadFileInput) {
    if (
      !FileModelUseCaseValidatorOptions[fileInput.model].includes(
        fileInput.use_case,
      )
    ) {
      throw new AppHttpException(ErrorCodeEnum.INVALID_MODEL_USE_CASE);
    }
  }

  async onFirstChunkValidator(
    fileInput: UploadFileInput,
    metadata: Busboy.FileInfo,
    chunk: Buffer,
  ) {
    const { use_case: useCase } = fileInput;
    const validationOptions: FileValidationOptions = ValidationOptions[useCase];

    if (
      !validationOptions.acceptedFormats.includes(
        metadata?.mimeType as FileTypeEnum,
      )
    ) {
      throw validationOptions.error;
    }

    const fileType = await fileTypeFromBuffer(chunk);

    if (
      fileType?.mime &&
      !validationOptions.acceptedFormats.includes(
        fileType?.mime as FileTypeEnum,
      )
    ) {
      throw validationOptions.error;
    }

    if (fileType?.mime != metadata.mimeType) throw validationOptions.error;
  }
}
