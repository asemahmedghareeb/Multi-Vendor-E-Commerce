import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';
import { SocialProviderEnum } from '../../../social-auth/enums/social-provider.enum';

@InputType()
export class LinkSocialAccountInput {
  @Field()
  @IsNotEmpty()
  token: string;

  @Field(() => SocialProviderEnum)
  socialProvider: SocialProviderEnum;
}
