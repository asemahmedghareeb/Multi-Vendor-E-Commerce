import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';
import { BlogMediaTypeEnum } from '../../enum/blog-media-type.enum';

@InputType()
export class BlogMediaInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  altText: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  caption: string;

  @Field(() => BlogMediaTypeEnum)
  type: BlogMediaTypeEnum;
}
