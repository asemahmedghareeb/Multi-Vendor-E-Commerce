import { ArgsType, Field } from '@nestjs/graphql';
import { SocialProviderEnum } from '../../enums/social-provider.enum';
import { Length } from 'class-validator';

@ArgsType()
export class GetUserSocialLoginOptionsInput {
  @Field(() => SocialProviderEnum)
  socialProvider: SocialProviderEnum;

  @Field()
  @Length(1, 10000)
  token: string;
}
