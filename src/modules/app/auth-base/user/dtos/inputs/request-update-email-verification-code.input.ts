import { ArgsType, Field, InputType } from '@nestjs/graphql';
import { IsEmail } from 'class-validator';

@ArgsType()
export class RequestUpdateEmailVerificationCodeInput {
  @Field()
  @IsEmail()
  newEmail: string;
}
