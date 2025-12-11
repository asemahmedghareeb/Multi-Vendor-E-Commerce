import { Type } from '@nestjs/common';
import { FileModelEnum } from '../enums/file-model.enum';
import { FileAuthGuardStrategy } from './file-auth-guard.strategy';
import { TestFileAuthGuard } from './file-model-guards/test-file-auth.strategy';

export const FileGuardOptions: {
  [key in FileModelEnum]: Type<FileAuthGuardStrategy>;
} = {
  public_test: TestFileAuthGuard,
};
