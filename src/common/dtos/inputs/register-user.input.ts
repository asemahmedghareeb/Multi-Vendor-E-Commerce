import { Field, InputType } from '@nestjs/graphql';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { LangEnum } from 'src/common/enums/lang.enum';

@InputType()
export class RegisterUserInput {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(10)
  @IsOptional()
  @Field({ nullable: true })
  firstName: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(10)
  @IsOptional()
  @Field({ nullable: true })
  lastName: string;

  @IsEmail()
  @IsOptional()
  @Field({ nullable: true })
  email?: string;

  @IsPhoneNumber()
  @IsOptional()
  @Field({ nullable: true })
  phoneNumber?: string;

  @IsOptional()
  @Field(() => LangEnum, { nullable: true })
  favLang: LangEnum;
}
