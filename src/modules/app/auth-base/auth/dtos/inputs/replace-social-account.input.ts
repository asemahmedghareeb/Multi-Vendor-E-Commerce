import { Field, InputType } from '@nestjs/graphql';
import { SocialProviderEnum } from '../../../social-auth/enums/social-provider.enum';
import { LoginDeviceInput } from 'src/common/dtos/inputs/login-device.input';
import { IsNotEmpty, Length, ValidateNested } from 'class-validator';

@InputType()
export class ReplaceSocialAccountInput {
  @Field(() => SocialProviderEnum)
  provider: SocialProviderEnum;

  @Field()
  @IsNotEmpty()
  @Length(1, 10000)
  token: string;

  @Field(() => LoginDeviceInput)
  @ValidateNested()
  loginDeviceInput: LoginDeviceInput;
}
