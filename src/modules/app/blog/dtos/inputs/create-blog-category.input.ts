import { Field, InputType, ObjectType } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

@InputType()
export class CreateBlogCategoryInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  slug: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  enName: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  arName: string;

  @Field({ nullable: true })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  @IsOptional()
  parentId?: string;
}
