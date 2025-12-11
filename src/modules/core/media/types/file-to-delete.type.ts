import { FileModelEnum } from '../enums/file-model.enum';

export type FileToDelete = {
  model: FileModelEnum;
  filename: string;
};
