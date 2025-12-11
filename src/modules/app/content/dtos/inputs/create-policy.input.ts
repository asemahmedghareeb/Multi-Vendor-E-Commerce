import { Field, InputType } from '@nestjs/graphql';
import { PolicyTypeEnum } from '../../enums/policy-type.enum';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

@InputType()
export class CreatePolicyInput {
  @Field(() => PolicyTypeEnum)
  type: PolicyTypeEnum;

  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  title: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  description: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  content: string;

  @Field({ nullable: true })
  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  @IsOptional()
  metaTitle: string;

  @Field({ nullable: true })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  @IsOptional()
  metaDescription: string;

  @Field({ nullable: true })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  @IsOptional()
  metaKeywords: string;
}
