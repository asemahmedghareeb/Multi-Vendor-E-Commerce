
import { IsEnum, IsNotEmpty, Matches, Validate } from 'class-validator';
import { FileModelEnum } from '../../enums/file-model.enum';

export class StreamFileInput {
  @IsEnum(FileModelEnum)
  model: string;

  @IsNotEmpty({ message: 'Value should not be empty' })
  @Matches(/^[a-zA-Z0-9\u0600-\u06FF._-]+$/)
  filename: string;
}
