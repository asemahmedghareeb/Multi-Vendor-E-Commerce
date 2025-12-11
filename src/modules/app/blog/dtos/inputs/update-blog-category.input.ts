import { Field, InputType, PartialType } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { CreateBlogCategoryInput } from './create-blog-category.input';

@InputType()
export class UpdateBlogCategoryInput extends PartialType(
  CreateBlogCategoryInput,
) {
  @Field()
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  id: string;
}
