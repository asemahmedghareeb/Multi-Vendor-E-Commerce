import { Field, InputType } from '@nestjs/graphql';
import { LinkSocialAccountInput } from './link-social-account.input';
import { LoginDeviceInput } from 'src/common/dtos/inputs/login-device.input';
import { ValidateNested } from 'class-validator';

@InputType()
export class RegisterSocialAccountForExistingUser extends LinkSocialAccountInput {
  @Field(() => LoginDeviceInput)
  @ValidateNested()
  loginDeviceInput: LoginDeviceInput;
}
