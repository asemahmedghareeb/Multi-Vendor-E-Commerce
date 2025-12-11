import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import { SocialAuthStrategy } from '../interfaces/social-auth-strategy.interface';
import { SocialProfile } from '../types/social-profile.type';

@Injectable()
export class GoogleStrategy implements SocialAuthStrategy {
  private oauthClient: OAuth2Client;
  private clientId: string;
  constructor(private readonly configService: ConfigService) {
    this.clientId = this.configService.getOrThrow('GOOGLE_CLIENT_ID');
    this.oauthClient = new OAuth2Client();
  }

  async validateProviderToken(idToken: string): Promise<SocialProfile> {
    const ticket = await this.oauthClient.verifyIdToken({
      idToken,
      audience: this.clientId,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      throw new Error('Invalid Google token');
    }

    
    return {
      email: payload.email,
      firstName: payload.given_name,
      lastName: payload.family_name,
      socialId: payload.sub,
    };
  }
}
