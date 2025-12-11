import { SocialProfile } from '../types/social-profile.type';

export interface SocialAuthStrategy {
  validateProviderToken(token: string): Promise<SocialProfile>;
}
