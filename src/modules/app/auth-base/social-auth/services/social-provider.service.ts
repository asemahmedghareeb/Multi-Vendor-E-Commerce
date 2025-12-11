import { Injectable } from '@nestjs/common';
import { SocialProviderEnum } from '../enums/social-provider.enum';
import { ModuleRef } from '@nestjs/core';
import { SocialProviders } from '../strategies';
import { SocialAuthStrategy } from '../interfaces/social-auth-strategy.interface';
import { AppHttpException } from 'src/common/exceptions/app-http.exception';
import { ErrorCodeEnum } from 'src/common/enums/error-code.enum';

@Injectable()
export class SocialProviderService {
  constructor(private readonly moduleRef: ModuleRef) {}

  async validateSocialToken(provider: SocialProviderEnum, token: string) {
    //todo
    // throw new AppHttpException(ErrorCodeEnum.NOT_IMPLEMENTED);

    const providerClass = SocialProviders[provider];
    const providerStrategy =
      this.moduleRef.get<SocialAuthStrategy>(providerClass);

    try {
      const profile = await providerStrategy.validateProviderToken(token);
      return profile;
    } catch (err) {
      throw new AppHttpException(ErrorCodeEnum.INVALID_SOCIAL_AUTH_TOKEN);
    }
  }
}
