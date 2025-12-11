import { Field, InputType } from '@nestjs/graphql';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { LangEnum } from 'src/common/enums/lang.enum';

@InputType()
export class CompleteUserProfileInfoInput {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(10)
  @Field()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(10)
  @Field()
  lastName?: string;

  @IsEmail()
  @IsOptional()
  @Field({ nullable: true })
  email: string;

  @IsOptional()
  @Field(() => LangEnum, { nullable: true })
  favLang?: LangEnum;
}
