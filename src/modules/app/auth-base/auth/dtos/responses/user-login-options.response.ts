import { Field, ObjectType } from '@nestjs/graphql';
import { SocialProviderEnum } from '../../../social-auth/enums/social-provider.enum';

@ObjectType()
export class UserLoginOptionsResponse {
  @Field()
  passwordStrategy: boolean;

  @Field()
  emailVerificationCodeStrategy: boolean;

  @Field()
  phoneNumberVerificationCodeStrategy: boolean;

  @Field(() => [SocialProviderEnum])
  socialProviders: SocialProviderEnum[];
}
