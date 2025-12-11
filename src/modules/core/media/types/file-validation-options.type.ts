import { HttpException } from '@nestjs/common';
import { FileTypeEnum } from '../enums/file-type.enum';

export type FileValidationOptions = {
  maxSizeInBytes: number;
  acceptedFormats: FileTypeEnum[];
  error: HttpException;
};
