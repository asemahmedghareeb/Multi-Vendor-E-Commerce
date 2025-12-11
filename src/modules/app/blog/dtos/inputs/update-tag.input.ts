import { Field, InputType, PartialType } from '@nestjs/graphql';
import { CreateTagInput } from './create-tag.input';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

@InputType()
export class UpdateTagInput extends PartialType(CreateTagInput) {
  @Field()
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  id: string;
}
