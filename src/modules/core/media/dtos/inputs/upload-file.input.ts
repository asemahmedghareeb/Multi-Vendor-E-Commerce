import { IsEnum } from 'class-validator';
import { FileUseCaseEnum } from '../../enums/file-use-case.enum';
import { FileModelEnum } from '../../enums/file-model.enum';
import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class UploadFileInput {
  @IsEnum(FileUseCaseEnum)
  @Field(() => FileUseCaseEnum)
  use_case: FileUseCaseEnum;

  @IsEnum(FileModelEnum)
  @Field(() => FileModelEnum)
  model: FileModelEnum;
}
