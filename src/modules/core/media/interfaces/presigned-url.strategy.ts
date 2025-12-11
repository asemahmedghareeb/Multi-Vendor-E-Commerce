import { FileTypeEnum } from '../enums/file-type.enum';

export interface PresignedUrlStrategy {
  getUploadPresignedUrl(
    fileName: string,
    fileModel: string,
    mimeType: FileTypeEnum,
    sizeInBytes: number,
    fileId: string,
  ): string | Promise<string>;

  getDownloadPresignedUrl(
    fileModel: string,
    fileName: string,
  ): string | Promise<string>;
}
