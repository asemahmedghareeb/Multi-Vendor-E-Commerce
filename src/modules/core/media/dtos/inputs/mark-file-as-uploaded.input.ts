import { InputType } from '@nestjs/graphql';
import { IsString, IsUUID } from 'class-validator';

@InputType()
export class MarkFileAsUploadedInput {
  @IsString()
  @IsUUID()
  fileId: string;
}
