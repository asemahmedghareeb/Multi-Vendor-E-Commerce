import { FileTypeEnum } from '../enums/file-type.enum';
import { FileUseCaseEnum } from '../enums/file-use-case.enum';
import { FileValidationOptions } from '../types/file-validation-options.type';
import { ErrorCodeEnum } from 'src/common/enums/error-code.enum';
import { generateFileValidationOptions } from '../utilities/generate-file-validation-options.utility';

export const ValidationOptions: {
  [key in FileUseCaseEnum]: FileValidationOptions;
} = {
  doc_test: generateFileValidationOptions(
    [FileTypeEnum.PDF],
    5 * 1024 * 1024,
    ErrorCodeEnum.INVALID_FILE_UPLOAD,
  ),
  image_test: generateFileValidationOptions(
    [FileTypeEnum.PNG, FileTypeEnum.JPG, FileTypeEnum.JPEG],
    5 * 1024 * 1024,
    ErrorCodeEnum.INVALID_FILE_UPLOAD,
  ),
  video_test: generateFileValidationOptions(
    [FileTypeEnum.MP4],
    100 * 1024 * 1024,
    ErrorCodeEnum.INVALID_FILE_UPLOAD,
  ),
};
