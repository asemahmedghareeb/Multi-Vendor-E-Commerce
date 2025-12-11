import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsString, ValidateNested } from 'class-validator';
import { LoginDeviceInput } from 'src/common/dtos/inputs/login-device.input';
import { VerificationCodeBaseInput } from './verification-code.input';

@InputType()
export class LoginUserWithEmailVerificationCodeInput extends VerificationCodeBaseInput {
  @Field()
  @IsString()
  @IsEmail()
  email: string;

  @Field(() => LoginDeviceInput)
  @ValidateNested()
  loginDeviceInput: LoginDeviceInput;
}
