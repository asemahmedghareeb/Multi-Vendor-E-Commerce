import { Field, InputType } from '@nestjs/graphql';
import { IsUUID, ValidateNested } from 'class-validator';
import { LoginDeviceInput } from 'src/common/dtos/inputs/login-device.input';
import { VerificationCodeBaseInput } from './verification-code.input';

@InputType()
export class VerifyUserInput extends VerificationCodeBaseInput {
  @Field()
  @IsUUID()
  userId: string;

  @Field(() => LoginDeviceInput, { nullable: true })
  @ValidateNested()
  loginDeviceInput: LoginDeviceInput;
}
