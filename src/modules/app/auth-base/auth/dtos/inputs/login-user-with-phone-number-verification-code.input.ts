import { Field, InputType } from '@nestjs/graphql';
import { IsPhoneNumber, IsString, ValidateNested } from 'class-validator';
import { LoginDeviceInput } from 'src/common/dtos/inputs/login-device.input';
import { VerificationCodeBaseInput } from './verification-code.input';

@InputType()
export class LoginUserWithPhoneNumberVerificationCodeInput extends VerificationCodeBaseInput {
  @Field()
  @IsString()
  @IsPhoneNumber()
  phoneNumber: string;

  @Field(() => LoginDeviceInput)
  @ValidateNested()
  loginDeviceInput: LoginDeviceInput;
}
