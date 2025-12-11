import { ArgsType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

@ArgsType()
export class SoftRemoveBlogCategoryInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  id: string;
}
