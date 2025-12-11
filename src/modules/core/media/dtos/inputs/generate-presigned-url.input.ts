import { Field, InputType } from '@nestjs/graphql';
import { UploadFileInput } from './upload-file.input';
import { IsNumber, IsPositive, IsString } from 'class-validator';
import { FileTypeEnum } from '../../enums/file-type.enum';
import { FileModelEnum } from '../../enums/file-model.enum';
import { FileUseCaseEnum } from '../../enums/file-use-case.enum';

@InputType()
export class GeneratePresignedUrlInput {
  @Field()
  @IsString()
  fileName: string;

  @Field(() => FileTypeEnum)
  mimeType: FileTypeEnum;

  @Field()
  @IsNumber()
  @IsPositive()
  sizeInBytes: number;

  @Field(() => FileModelEnum)
  fileModel: FileModelEnum;

  @Field(() => FileUseCaseEnum)
  fileUseCase: FileUseCaseEnum;
}
