import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { FaqForEnum } from '../../enums/faq-for.enum';
import { ContentStatusEnum } from '../../enums/content-status.enum';

@InputType()
export class CreateFAQInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  enQuestion: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  arQuestion: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  enAnswer: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  arAnswer: string;

  @Field(() => FaqForEnum)
  for: FaqForEnum;

  @Field(() => ContentStatusEnum)
  status: ContentStatusEnum;
}
