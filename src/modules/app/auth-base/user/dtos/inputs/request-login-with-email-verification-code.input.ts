import { ArgsType, Field } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

@ArgsType()
export class RequestLoginWithEmailVerificationCodeInput {
  @Field()
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  email: string;
}
