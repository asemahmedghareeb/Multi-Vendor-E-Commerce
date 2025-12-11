import { Field, InputType, PartialType } from '@nestjs/graphql';
import { CreateFAQInput } from './create-faq.input';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

@InputType()
export class UpdateFAQInput extends PartialType(CreateFAQInput) {
  @Field()
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  id: string;
}