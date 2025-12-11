import * as Busboy from 'busboy';
import { UploadFileInput } from '../dtos/inputs/upload-file.input';
import { FileModelEnum } from '../enums/file-model.enum';
import { Request, Response } from 'express';
import { FileToDelete } from '../types/file-to-delete.type';

export interface UploaderStrategy {
  uploadFile(
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
  ): Promise<Partial<File>>;

  streamFile(
    model: FileModelEnum,
    filename: string,
    res: Response,
  ): void | Promise<void>;

  deleteFiles(filesToDelete: FileToDelete[]): void;

  
}
