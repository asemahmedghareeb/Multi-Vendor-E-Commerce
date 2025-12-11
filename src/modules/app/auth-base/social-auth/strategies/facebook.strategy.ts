import axios from 'axios';
import { FacebookDebugTokenResponse } from '../types/facebook-debug-token-response.type';
import { SocialProfile } from '../types/social-profile.type';
import { SocialAuthStrategy } from '../interfaces/social-auth-strategy.interface';
import { FacebookUserData } from '../types/facebook-user-data.type';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';

@Injectable()
export class FacebookStrategy implements SocialAuthStrategy {
  private appId: string;
  private appSecret: string;

  constructor(private readonly configService: ConfigService) {
    this.appId = this.configService.getOrThrow('FACE_BOOK_APP_ID');
    this.appSecret = this.configService.getOrThrow('FACE_BOOK_SECRET');
  }

  async validateProviderToken(token: string): Promise<SocialProfile> {
    const appAccessToken = `${this.appId}|${this.appSecret}`;

    const debugRes = await axios.get<FacebookDebugTokenResponse>(
      'https://graph.facebook.com/debug_token',
      {
        params: {
          input_token: token,
          access_token: appAccessToken,
        },
      },
    );

    const debugData = debugRes.data.data;

    if (!debugData.is_valid) {
      throw new Error('Invalid Facebook token');
    }

    const userRes = await axios.get<FacebookUserData>(
      'https://graph.facebook.com/me',
      {
        params: {
          fields: 'id,first_name,last_name,email',
          access_token: token,
        },
      },
    );

    const userData = userRes.data;

    return {
      email: userData.email,
      socialId: userData.id,
      firstName: userData.first_name,
      lastName: userData.last_name,
    };
  }
}
