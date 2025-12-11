import { ErrorCodeEnum } from 'src/common/enums/error-code.enum';
import { FileTypeEnum } from '../enums/file-type.enum';
import { FileValidationOptions } from '../types/file-validation-options.type';
import { AppHttpException } from 'src/common/exceptions/app-http.exception';

export function generateFileValidationOptions(
  acceptedFormats: FileTypeEnum[],
  maxSizeInBytes: number,
  errorCode: ErrorCodeEnum,
): FileValidationOptions {
  return {
    acceptedFormats,
    maxSizeInBytes,
    error: new AppHttpException(errorCode, {
      acceptedFormats,
      maxSizeInBytes,
    }),
  };
}