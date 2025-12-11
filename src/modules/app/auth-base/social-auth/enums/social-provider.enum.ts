import { registerEnumType } from '@nestjs/graphql';

export enum SocialProviderEnum {
  GOOGLE = 'GOOGLE',
  FACEBOOK = 'FACEBOOK',
  // APPLE = 'APPLE',
}

registerEnumType(SocialProviderEnum, {name: "SocialProviderEnum"});
