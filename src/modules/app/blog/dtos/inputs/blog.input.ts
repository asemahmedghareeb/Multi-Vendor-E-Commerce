import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';
import { BlogStatusEnum } from '../../enum/blog-status.enum';
import { TimestampScalar } from 'src/common/scalars/timestamp.scalar';

@InputType()
export class BlogInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  enTitle: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  arTitle: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  slug: string;

  @Field(() => BlogStatusEnum)
  status: BlogStatusEnum;

  @Field(() => TimestampScalar)
  publishedDate: Date;

  @Field()
  @IsString()
  @IsNotEmpty()
  arHtmlBody: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  enHtmlBody: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  authorId: string;
}
