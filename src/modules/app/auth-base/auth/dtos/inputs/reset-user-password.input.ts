import { Field, InputType } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsNumberString,
  IsString,
  IsStrongPassword,
  MaxLength,
  MinLength,
} from 'class-validator';
import { VerificationCodeBaseInput } from './verification-code.input';

@InputType()
export class ResetUserPasswordInput extends VerificationCodeBaseInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  emailOrPhoneNumber: string;

  @Field()
  @IsStrongPassword()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  newPassword: string;
}
