import { ArgsType, Field } from '@nestjs/graphql';
import { SocialProviderEnum } from '../../../social-auth/enums/social-provider.enum';

@ArgsType()
export class UnlinkUserSocialAccountInput {
  @Field(() => SocialProviderEnum)
  socialProvider: SocialProviderEnum;
}
