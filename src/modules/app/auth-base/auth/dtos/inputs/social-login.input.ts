import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { LoginDeviceInput } from 'src/common/dtos/inputs/login-device.input';
import { SocialProviderEnum } from '../../../social-auth/enums/social-provider.enum';

@InputType()
export class SocialLoginInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  token: string;

  @Field(() => SocialProviderEnum)
  provider: SocialProviderEnum;

  @Field(() => LoginDeviceInput)
  @ValidateNested()
  loginDeviceInput: LoginDeviceInput;
}
