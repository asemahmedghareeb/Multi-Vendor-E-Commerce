import { Injectable } from '@nestjs/common';
import { SocialProviderService } from './social-provider.service';
import { SocialRegisterUserInput } from '../../auth/dtos/inputs/social-register-user.input';
import { SocialProfile } from '../types/social-profile.type';
import { AppHttpException } from 'src/common/exceptions/app-http.exception';
import { ErrorCodeEnum } from 'src/common/enums/error-code.enum';
import { InjectAppRepository } from 'src/common/decorators/inject-app-repository.decorator';
import { SocialAccount } from '../entities/social-account.entity';
import { AppRepository } from 'src/modules/core/app-database/repositories/app.repository';
import { User } from '../../user/entities/user.entity';
import { SocialProviderEnum } from '../enums/social-provider.enum';
import { FindOptionsWhere } from 'typeorm';
import { UserSocialLoginActionsEnum } from '../enums/user-social-login-actions.enum';

@Injectable()
export class SocialAuthService {
  constructor(
    private readonly socialProviderService: SocialProviderService,
    @InjectAppRepository(SocialAccount)
    private readonly socialAccountRepository: AppRepository<SocialAccount>,
    @InjectAppRepository(User)
    private readonly userRepository: AppRepository<User>,
  ) {}

  async getUserSocialLoginRequiredAction(
    socialProvider: SocialProviderEnum,
    token: string,
  ) {
    const socialProfile = await this.socialProviderService.validateSocialToken(
      socialProvider,
      token,
    );

    const existedSocialAccount = await this.socialAccountRepository.findOne({
      where: {
        socialId: socialProfile.socialId,
        socialProvider,
      },
    });

    if (existedSocialAccount)
      return UserSocialLoginActionsEnum.SOCIAL_LOGIN_USER;

    const user = await this.userRepository.findOne({
      where: {
        email: socialProfile.email,
        isVerifiedEmail: true,
      },
      relations: {
        socialAccounts: true,
      },
    });

    if (
      !!user?.socialAccounts.find(
        (account) => account.socialProvider == socialProvider,
      )
    )
      return UserSocialLoginActionsEnum.REPLACE_SOCIAL_ACCOUNT;

    if (!!user)
      return UserSocialLoginActionsEnum.REGISTER_SOCIAL_ACCOUNT_FOR_EXISTING_USER;

    return UserSocialLoginActionsEnum.SOCIAL_REGISTER_USER;
  }

  async validateLinkingSocialAccountEligibility(
    socialProvider: SocialProviderEnum,
    token: string,
    userId?: string,
  ): Promise<SocialProfile> {
    const socialProfile = await this.socialProviderService.validateSocialToken(
      socialProvider,
      token,
    );

    const where: FindOptionsWhere<SocialAccount>[] = [
      {
        socialId: socialProfile.socialId,
        socialProvider,
      },
    ];

    if (userId)
      where.push({
        socialProvider,
        userId,
      });

    const existedSocialAccount = await this.socialAccountRepository.findOne({
      where,
    });

    if (
      existedSocialAccount &&
      userId &&
      userId == existedSocialAccount.userId
    ) {
      throw new AppHttpException(
        ErrorCodeEnum.USER_ALREADY_CONNECTED_TO_THIS_SOCIAL_PROVIDER,
      );
    } else if (existedSocialAccount) {
      throw new AppHttpException(ErrorCodeEnum.SOCIAL_ID_ALREADY_EXIST);
    }

    return socialProfile;
  }

  async getUserConnectedSocialProviders(userId: string) {
    const socialAccounts = await this.socialAccountRepository.find({
      where: {
        userId,
      },
    });

    return socialAccounts.map(({ socialProvider }) => socialProvider);
  }

  linkSocialAccount(
    socialProfile: SocialProfile,
    socialProvider: SocialProviderEnum,
    user: User,
  ) {
    return this.socialAccountRepository.createOne({
      user,
      socialId: socialProfile.socialId,
      socialProvider: socialProvider,
    });
  }

  unlinkSocialAccount(userId: string, socialProvider: SocialProviderEnum) {
    return this.socialAccountRepository.delete({
      socialProvider,
      userId,
    });
  }

  async validateSocialLoginToken(
    socialProvider: SocialProviderEnum,
    token: string,
  ): Promise<SocialProfile> {
    const socialProfile = await this.socialProviderService.validateSocialToken(
      socialProvider,
      token,
    );

    return socialProfile;
  }

  async validateUserSocialLogin(
    socialId: string,
    provider: SocialProviderEnum,
  ) {
    const socialAccount = await this.socialAccountRepository.findOne({
      where: {
        socialId,
        socialProvider: provider,
      },
      relations: {
        user: true,
      },
    });

    if (!socialAccount || !socialAccount.user.isVerified)
      throw new AppHttpException(ErrorCodeEnum.USER_DOES_NOT_EXIST);

    return socialAccount;
  }
}
