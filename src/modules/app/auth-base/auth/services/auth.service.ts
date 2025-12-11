import { Injectable } from '@nestjs/common';
import { UserService } from '../../user/services/user.service';
import { InjectAppRepository } from 'src/common/decorators/inject-app-repository.decorator';
import { User } from '../../user/entities/user.entity';
import { AppRepository } from 'src/modules/core/app-database/repositories/app.repository';
import { AppHttpException } from 'src/common/exceptions/app-http.exception';
import { ErrorCodeEnum } from 'src/common/enums/error-code.enum';
import { LoginUserWithPasswordInput } from '../dtos/inputs/login-user-with-password.input';
import * as bcrypt from 'bcryptjs';
import { SessionService } from '../../session/services/session.service';
import { AppJwtService } from 'src/modules/core/app-jwt/services/app-jwt.service';
import { Session } from '../../session/entities/session.entity';
import { ManualRegisterWithPasswordInput } from '../dtos/inputs/manual-register-user-with-password.input';
import { VerifyUserInput } from '../dtos/inputs/verify-user-email.input';
import { VerificationCodeUseCaseEnum } from '../../user/enums/verification-code-use-case.enum';
import { UserVerificationCodeService } from '../../user/services/user-verification-code.service';
import { LoginDeviceInput } from 'src/common/dtos/inputs/login-device.input';
import { ResetUserPasswordInput } from '../dtos/inputs/reset-user-password.input';
import { Not } from 'typeorm';
import { LoginUserWithEmailVerificationCodeInput } from '../dtos/inputs/login-user-with-email-verification-code.input';
import { LoginUserWithPhoneNumberVerificationCodeInput } from '../dtos/inputs/login-user-with-phone-number-verification-code.input';
import { SocialAuthService } from '../../social-auth/services/social-auth.service';
import { SocialRegisterUserInput } from 'src/modules/app/auth-base/auth/dtos/inputs/social-register-user.input';
import { UserRoleEnum } from 'src/common/enums/user-role.enum';
import { SocialLoginInput } from '../dtos/inputs/social-login.input';
import { ChangeUserPasswordInput } from '../dtos/inputs/change-user-password.input';
import { LinkSocialAccountInput } from '../dtos/inputs/link-social-account.input';
import { SocialProviderEnum } from '../../social-auth/enums/social-provider.enum';
import { UserLoginOptionsResponse } from '../dtos/responses/user-login-options.response';
import { RegisterSocialAccountForExistingUser } from '../dtos/inputs/register-social-account-for-existing-user.input';
import { ReplaceSocialAccountInput } from '../dtos/inputs/replace-social-account.input';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly sessionService: SessionService,
    private readonly appJwtService: AppJwtService,
    private readonly userVerificationCodeService: UserVerificationCodeService,
    private readonly socialAuthService: SocialAuthService,
    @InjectAppRepository(User)
    private readonly userRepository: AppRepository<User>,
    @InjectAppRepository(Session)
    private readonly sessionRepository: AppRepository<Session>,
  ) {}

  private async loginUser(user: User, loginDeviceInput: LoginDeviceInput) {
    if (user.isBlocked) {
      throw new AppHttpException(ErrorCodeEnum.UNAUTHORIZED);
    }

    const session = await this.sessionService.startSession(
      user,
      loginDeviceInput,
    );

    return this.appJwtService.generateAppJwtToken(
      session.id,
      session.accessExpiryDate,
      session.refreshExpiryDate,
    );
  }

  async registerUser(
    input: ManualRegisterWithPasswordInput,
    role: UserRoleEnum = UserRoleEnum.USER,
  ) {
    if (!input.email && !input.phoneNumber) {
      throw new AppHttpException(
        ErrorCodeEnum.UNDEFINED_EMAIL_AND_PHONE_NUMBER,
      );
    }
    await this.userService.verifyUserRegistrationEligibility(input);
    const user = await this.userService.registerUser(input, role, false, false);
    return user;
  }

  async socialRegisterUser(
    input: SocialRegisterUserInput,
    role: UserRoleEnum = UserRoleEnum.USER,
  ) {
    const socialProfile =
      await this.socialAuthService.validateLinkingSocialAccountEligibility(
        input.socialProvider,
        input.token,
      );

    if (
      socialProfile.email &&
      input.email &&
      input.email != socialProfile.email
    ) {
      //? email should be provided only when the social provide does not provide an email!!
      throw new AppHttpException(
        ErrorCodeEnum.EMAIL_PROVIDED_BOTH_MANUALLY_AND_BY_SOCIAL_PROVIDE,
      );
    }

    if (!socialProfile.email && !input.email) {
      throw new AppHttpException(ErrorCodeEnum.NOT_PROVIDED_EMAIL);
    }

    const isVerifiedEmail = socialProfile.email ? true : false;
    input.email = input.email || socialProfile.email;
    input.firstName = input.firstName || socialProfile.firstName;
    input.lastName = input.lastName || socialProfile.lastName;

    await this.userService.verifyUserRegistrationEligibility(input);

    const user = await this.userService.registerUser(
      input,
      role,
      isVerifiedEmail,
      false,
    );

    await this.socialAuthService.linkSocialAccount(
      socialProfile,
      input.socialProvider,
      user,
    );

    if (input.loginDeviceInput)
      user.jwtAutToken = await this.loginUser(user, input.loginDeviceInput);

    return user;
  }

  async verifyUserEmail(input: VerifyUserInput) {
    const user = await this.userService.validateUserWithIdExist(input.userId);

    if (user.isVerifiedEmail)
      throw new AppHttpException(ErrorCodeEnum.USER_EMAIL_ALREADY_VERIFIED);

    await this.userVerificationCodeService.verifyAndConsumeCode(
      user.id,
      VerificationCodeUseCaseEnum.EMAIL_VERIFICATION,
      input.code,
    );

    await this.userRepository.updateMany(
      { email: user.email as string, id: Not(user.id) },
      {
        email: null,
      },
    );

    await this.userRepository.updateOneFromExistingModel(user, {
      isVerifiedEmail: true,
    });

    if (input.loginDeviceInput)
      user.jwtAutToken = await this.loginUser(user, input.loginDeviceInput);

    return user;
  }

  async verifyUserPhoneNumber(input: VerifyUserInput) {
    const user = await this.userService.validateUserWithIdExist(input.userId);

    if (user.isVerifiedPhoneNumber)
      throw new AppHttpException(
        ErrorCodeEnum.USER_PHONE_NUMBER_ALREADY_VERIFIED,
      );

    await this.userVerificationCodeService.verifyAndConsumeCode(
      user.id,
      VerificationCodeUseCaseEnum.PHONE_NUMBER_VERIFICATION,
      input.code,
    );

    await this.userRepository.updateMany(
      { phoneNumber: user.phoneNumber as string, id: Not(user.id) },
      {
        phoneNumber: null,
      },
    );

    await this.userRepository.updateOneFromExistingModel(user, {
      isVerifiedPhoneNumber: true,
    });

    if (input.loginDeviceInput)
      user.jwtAutToken = await this.loginUser(user, input.loginDeviceInput);

    return user;
  }

  async loginUserWithPassword(input: LoginUserWithPasswordInput) {
    const user =
      await this.userService.validateUserWithVerifiedEmailOrPhoneNumberExist(
        input.emailOrPhoneNumber,
      );

    const isValidPassword = await bcrypt.compare(input.password, user.password);

    if (!isValidPassword)
      throw new AppHttpException(ErrorCodeEnum.WRONG_EMAIL_OR_PASSWORD);

    user.jwtAutToken = await this.loginUser(user, input.loginDeviceInput);

    return user;
  }

  async loginUserWithEmailVerificationCode(
    input: LoginUserWithEmailVerificationCodeInput,
  ) {
    const user = await this.userService.validateUserWithVerifiedEmailExist(
      input.email,
    );

    await this.userVerificationCodeService.verifyAndConsumeCode(
      user.id,
      VerificationCodeUseCaseEnum.LOG_IN_USER_WITH_EMAIL,
      input.code,
    );

    user.jwtAutToken = await this.loginUser(user, input.loginDeviceInput);

    return user;
  }

  async loginUserWithPhoneNumberVerificationCode(
    input: LoginUserWithPhoneNumberVerificationCodeInput,
  ) {
    const user =
      await this.userService.validateUserWithVerifiedPhoneNumberExist(
        input.phoneNumber,
      );

    await this.userVerificationCodeService.verifyAndConsumeCode(
      user.id,
      VerificationCodeUseCaseEnum.LOG_IN_USER_WITH_PHONE_NUMBER,
      input.code,
    );

    user.jwtAutToken = await this.loginUser(user, input.loginDeviceInput);

    return user;
  }

  async socialLoginUser(input: SocialLoginInput) {
    const socialProfile = await this.socialAuthService.validateSocialLoginToken(
      input.provider,
      input.token,
    );

    const socialAccount = await this.socialAuthService.validateUserSocialLogin(
      socialProfile.socialId,
      input.provider,
    );

    socialAccount.user.jwtAutToken = await this.loginUser(
      socialAccount.user,
      input.loginDeviceInput,
    );

    return socialAccount.user;
  }

  async restUserPassword(input: ResetUserPasswordInput) {
    const user =
      await this.userService.validateUserWithVerifiedEmailOrPhoneNumberExist(
        input.emailOrPhoneNumber,
      );

    await this.userVerificationCodeService.verifyAndConsumeCode(
      user.id,
      VerificationCodeUseCaseEnum.PASSWORD_RESET,
      input.code,
    );

    await this.userService.updateUserPassword(user, input.newPassword);

    return true;
  }

  async changeUserPassword(user: User, input: ChangeUserPasswordInput) {
    if (!user.password && input.oldPassword) {
      throw new AppHttpException(ErrorCodeEnum.BAD_REQUEST_EXCEPTION, {
        message:
          'User does not have a password, oldPassword field should be empty.',
      });
    }

    if (user.password && !user.requireSettingPassword) {
      if (!input.oldPassword) {
        throw new AppHttpException(ErrorCodeEnum.BAD_REQUEST_EXCEPTION, {
          message: 'User have a password, oldPassword field can not be empty.',
        });
      }
      const isValidPassword = await bcrypt.compare(
        input.oldPassword,
        user.password,
      );

      if (!isValidPassword)
        throw new AppHttpException(ErrorCodeEnum.INCORRECT_PASSWORD);
    }
    await this.userService.updateUserPassword(user, input.newPassword);

    return true;
  }

  async updateUserEmail(user: User, code: string) {
    const verificationCode =
      await this.userVerificationCodeService.verifyAndConsumeCode(
        user.id,
        VerificationCodeUseCaseEnum.UPDATE_EMAIL,
        code,
      );

    await this.userService.validateUserWithVerifiedEmailDoesNotExist(
      verificationCode.metadata.newEmail as string,
    );

    const updatedUser = await this.userRepository.updateOneFromExistingModel(
      user,
      {
        email: verificationCode.metadata.newEmail,
        isVerifiedEmail: true,
      },
    );

    await this.userRepository.updateMany(
      { email: updatedUser.email as string, id: Not(user.id) },
      {
        email: null,
      },
    );

    return true;
  }

  async updateUserPhoneNumber(user: User, code: string) {
    const verificationCode =
      await this.userVerificationCodeService.verifyAndConsumeCode(
        user.id,
        VerificationCodeUseCaseEnum.UPDATE_PHONE_NUMBER,
        code,
      );

    await this.userService.validateUserWithVerifiedPhoneNumberDoesNotExist(
      verificationCode.metadata.newPhoneNumber as string,
    );

    const updatedUser = await this.userRepository.updateOneFromExistingModel(
      user,
      {
        phoneNumber: verificationCode.metadata.newPhoneNumber,
        isVerifiedPhoneNumber: true,
      },
    );

    await this.userRepository.updateMany(
      { phoneNumber: updatedUser.phoneNumber as string, id: Not(user.id) },
      {
        phoneNumber: null,
      },
    );

    return true;
  }

  async linkSocialAccount(user: User, input: LinkSocialAccountInput) {
    const socialProfile =
      await this.socialAuthService.validateLinkingSocialAccountEligibility(
        input.socialProvider,
        input.token,
        user.id,
      );

    await this.socialAuthService.linkSocialAccount(
      socialProfile,
      input.socialProvider,
      user,
    );

    return true;
  }

  async unlinkSocialAccount(user: User, socialProvider: SocialProviderEnum) {
    const userSocialProviders: SocialProviderEnum[] =
      await this.socialAuthService.getUserConnectedSocialProviders(user.id);

    if (
      !userSocialProviders.find(
        (userSocialProvider) => socialProvider == userSocialProvider,
      )
    ) {
      throw new AppHttpException(ErrorCodeEnum.BAD_REQUEST_EXCEPTION, {
        message: `${socialProvider} is not connected to this account!`,
      });
    }

    if (!user.password && userSocialProviders.length < 2) {
      throw new AppHttpException(ErrorCodeEnum.BAD_REQUEST_EXCEPTION, {
        message: `${socialProvider} is the only provider the user can login with!`,
      });
    }

    await this.socialAuthService.unlinkSocialAccount(user.id, socialProvider);

    return true;
  }

  async registerSocialAccountForExistingUser(
    input: RegisterSocialAccountForExistingUser,
  ) {
    const socialProfile =
      await this.socialAuthService.validateLinkingSocialAccountEligibility(
        input.socialProvider,
        input.token,
      );

    const user = await this.userRepository.findOne({
      where: {
        email: socialProfile.email,
        isVerifiedEmail: true,
      },
    });

    if (!user) throw new AppHttpException(ErrorCodeEnum.USER_DOES_NOT_EXIST);

    const userSocialProviders =
      await this.socialAuthService.getUserConnectedSocialProviders(user.id);

    if (
      userSocialProviders.find((provider) => provider == input.socialProvider)
    )
      throw new AppHttpException(
        ErrorCodeEnum.USER_ALREADY_CONNECTED_TO_THIS_SOCIAL_PROVIDER,
      );

    await this.socialAuthService.linkSocialAccount(
      socialProfile,
      input.socialProvider,
      user,
    );

    user.jwtAutToken = await this.loginUser(user, input.loginDeviceInput);

    return user;
  }

  async replaceSocialAccount(input: ReplaceSocialAccountInput) {
    const socialProfile =
      await this.socialAuthService.validateLinkingSocialAccountEligibility(
        input.provider,
        input.token,
      );

    const user = await this.userRepository.findOne({
      where: {
        email: socialProfile.email,
        isVerifiedEmail: true,
      },
    });

    if (!user) throw new AppHttpException(ErrorCodeEnum.USER_DOES_NOT_EXIST);

    await this.socialAuthService.unlinkSocialAccount(user.id, input.provider);

    await this.socialAuthService.linkSocialAccount(
      socialProfile,
      input.provider,
      user,
    );

    user.jwtAutToken = await this.loginUser(user, input.loginDeviceInput);

    return user;
  }

  async getUserLoginOptions(
    emailOrPhoneNumber: string,
  ): Promise<UserLoginOptionsResponse> {
    const user = await this.userRepository.findOne({
      where: [
        {
          email: emailOrPhoneNumber,
          isVerifiedEmail: true,
        },
        {
          phoneNumber: emailOrPhoneNumber,
          isVerifiedPhoneNumber: true,
        },
      ],
      relations: {
        socialAccounts: true,
      },
    });

    if (!user) throw new AppHttpException(ErrorCodeEnum.USER_DOES_NOT_EXIST);

    const socialProviders = user.socialAccounts.map(
      ({ socialProvider }) => socialProvider,
    );

    return {
      emailVerificationCodeStrategy: user.isVerifiedEmail,
      phoneNumberVerificationCodeStrategy: user.isVerifiedPhoneNumber,
      passwordStrategy: user.hasPassword,
      socialProviders,
    };
  }

  async logoutUser(session: Session) {
    await this.sessionRepository.remove(session);
    return true;
  }
}
