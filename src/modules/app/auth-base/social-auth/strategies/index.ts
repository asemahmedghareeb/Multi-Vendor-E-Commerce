import { Type } from '@nestjs/common';
import { SocialProviderEnum } from '../enums/social-provider.enum';
import { SocialAuthStrategy } from '../interfaces/social-auth-strategy.interface';
// import { AppleStrategy } from './apple.strategy';
import { FacebookStrategy } from './facebook.strategy';
import { GoogleStrategy } from './google.strategy';

export const SocialProviders: {
  [key in SocialProviderEnum]: Type<SocialAuthStrategy>;
} = {
  // APPLE: AppleStrategy,
  FACEBOOK: FacebookStrategy,
  GOOGLE: GoogleStrategy,
};
