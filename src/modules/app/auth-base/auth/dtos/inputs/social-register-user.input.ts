
import { Field, InputType, PartialType } from '@nestjs/graphql';
import { SocialProviderEnum } from '../../../social-auth/enums/social-provider.enum';
import { IsNotEmpty, ValidateNested } from 'class-validator';
import { RegisterUserInput } from 'src/common/dtos/inputs/register-user.input';
import { LoginDeviceInput } from '../../../../../../common/dtos/inputs/login-device.input';

@InputType()
export class SocialRegisterUserInput extends PartialType(RegisterUserInput) {
  @Field()
  @IsNotEmpty()
  token: string;

  @Field(() => SocialProviderEnum)
  socialProvider: SocialProviderEnum;

  @Field(() => LoginDeviceInput, { nullable: true })
  @ValidateNested()
  loginDeviceInput: LoginDeviceInput;
}
