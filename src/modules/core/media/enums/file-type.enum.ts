import { registerEnumType } from '@nestjs/graphql';

export enum FileTypeEnum {
  // Images
  JPG = 'image/jpeg',
  JPEG = 'image/jpeg',
  PNG = 'image/png',
  GIF = 'image/gif',
  WEBP = 'image/webp',
  SVG = 'image/svg+xml',
  BMP = 'image/bmp',
  TIFF = 'image/tiff',

  // Videos
  MP4 = 'video/mp4',
  MOV = 'video/quicktime',
  AVI = 'video/x-msvideo',
  WMV = 'video/x-ms-wmv',
  FLV = 'video/x-flv',
  MKV = 'video/x-matroska',
  WEBM = 'video/webm',

  // Audio
  MP3 = 'audio/mpeg',
  WAV = 'audio/wav',
  OGG = 'audio/ogg',
  AAC = 'audio/aac',
  FLAC = 'audio/flac',

  // Documents
  PDF = 'application/pdf',
  DOC = 'application/msword',
  DOCX = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  XLS = 'application/vnd.ms-excel',
  XLSX = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  PPT = 'application/vnd.ms-powerpoint',
  PPTX = 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  TXT = 'text/plain',
  RTF = 'application/rtf',
  CSV = 'text/csv',
  JSON = 'application/json',

  // Archives
  ZIP = 'application/zip',
  RAR = 'application/vnd.rar',
  TAR = 'application/x-tar',
  GZ = 'application/gzip',
  _7Z = 'application/x-7z-compressed',
}

registerEnumType(FileTypeEnum, {
  name: 'FileTypeEnum',
});
