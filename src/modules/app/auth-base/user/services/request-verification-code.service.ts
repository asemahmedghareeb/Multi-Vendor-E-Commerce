import { Injectable } from '@nestjs/common';
import { UserService } from './user.service';
import { MailService } from 'src/modules/core/mail/services/mail.service';
import { SmsService } from 'src/modules/core/sms/services/sms.service';
import { RequestUserVerificationCodeInput } from '../dtos/inputs/request-user-verification-code.input';
import { MailSubjectEnum } from 'src/modules/core/mail/enums/mail-subject.enum';
import { MailTemplateEnum } from 'src/modules/core/mail/enums/mail-template.enum';
import { AppConfig } from 'src/config/app.config';
import { AppHttpException } from 'src/common/exceptions/app-http.exception';
import { ErrorCodeEnum } from 'src/common/enums/error-code.enum';
import { UserVerificationCodeService } from './user-verification-code.service';
import { VerificationCodeUseCaseEnum } from '../enums/verification-code-use-case.enum';
import { SmsMessageEnum } from 'src/modules/core/sms/enum/sms-message.enum';
import { RequestLoginWithEmailVerificationCodeInput } from '../dtos/inputs/request-login-with-email-verification-code.input';
import { RequestLoginWithPhoneNumberVerificationCodeInput } from '../dtos/inputs/request-login-with-phone-number-verification-code.input';
import { AdminGroupService } from '../../admin-group/services/admin-group.service';
import { User } from '../entities/user.entity';
import { RequestUpdateEmailVerificationCodeInput } from '../dtos/inputs/request-update-email-verification-code.input';
import { UserRoleEnum } from 'src/common/enums/user-role.enum';
import { RequestUpdatePhoneNumberVerificationCodeInput } from '../dtos/inputs/request-update-phone-number-verification-code.input';
import { RequestResetUserPasswordVerificationCodeInput } from '../dtos/inputs/request-reset-user-password-verification-code.input';
import { VerificationCodeStrategyEnum } from '../enums/verification-code.strategy.enum';
import { SmsStrategyEnum } from 'src/modules/core/sms/enum/sms-strategy.enum';

@Injectable()
export class RequestVerificationService {
  constructor(
    private readonly userService: UserService,
    private readonly mailService: MailService,
    private readonly smsService: SmsService,
    private readonly userVerificationCodeService: UserVerificationCodeService,
    private readonly adminGroupService: AdminGroupService,
  ) {}

  async requestVerifyUserEmailVerificationCode(
    input: RequestUserVerificationCodeInput,
  ) {
    const user = await this.userService.validateUserWithIdExist(input.userId);

    if (!user.email)
      throw new AppHttpException(ErrorCodeEnum.BAD_REQUEST_EXCEPTION, {
        message: 'user does not have an email',
      });

    if (user.isVerifiedEmail)
      throw new AppHttpException(ErrorCodeEnum.USER_EMAIL_ALREADY_VERIFIED);

    const verificationCode =
      await this.userVerificationCodeService.createVerificationCode(
        user.id,
        VerificationCodeUseCaseEnum.EMAIL_VERIFICATION,
      );

    this.mailService.sendEmailWithATemplate(
      user.email as string,
      MailSubjectEnum.VERIFY_USER_EMAIL,
      MailTemplateEnum.VERIFY_USER_EMAIL,
      {
        code: verificationCode.code,
        appName: AppConfig.AppName,
      },
      user.favLang,
    );
    return true;
  }

  async requestVerifyUserPhoneNumberVerificationCode(
    input: RequestUserVerificationCodeInput,
  ) {
    const user = await this.userService.validateUserWithIdExist(input.userId);

    if (!user.phoneNumber)
      throw new AppHttpException(ErrorCodeEnum.BAD_REQUEST_EXCEPTION, {
        message: 'user does not have a phoneNumber',
      });

    if (user.isVerifiedPhoneNumber)
      throw new AppHttpException(
        ErrorCodeEnum.USER_PHONE_NUMBER_ALREADY_VERIFIED,
      );

    const verificationCode =
      await this.userVerificationCodeService.createVerificationCode(
        user.id,
        VerificationCodeUseCaseEnum.PHONE_NUMBER_VERIFICATION,
      );

    this.smsService.sendLocalizedSms(
      user.phoneNumber as string,
      SmsMessageEnum.PHONE_VERIFICATION_CODE,
      {
        code: verificationCode.code,
      },
      user.favLang,
      input.smsStrategy,
    );
    return true;
  }

  async requestLoginUserVerificationCodeWithEmail(
    input: RequestLoginWithEmailVerificationCodeInput,
  ) {
    const user = await this.userService.validateUserWithVerifiedEmailExist(
      input.email,
    );

    const verificationCode =
      await this.userVerificationCodeService.createVerificationCode(
        user.id,
        VerificationCodeUseCaseEnum.LOG_IN_USER_WITH_EMAIL,
      );

    this.mailService.sendEmailWithATemplate(
      user.email as string,
      MailSubjectEnum.LOGIN_USER_WITH_VERIFICATION_CODE,
      MailTemplateEnum.LOGIN_USER_WITH_VERIFICATION_CODE,
      {
        appName: AppConfig.AppName,
        code: verificationCode.code,
      },
      user.favLang,
    );
    return true;
  }

  async requestLoginUserVerificationCodeWithPhoneNumber(
    input: RequestLoginWithPhoneNumberVerificationCodeInput,
  ) {
    const user =
      await this.userService.validateUserWithVerifiedPhoneNumberExist(
        input.phoneNumber,
      );

    const verificationCode =
      await this.userVerificationCodeService.createVerificationCode(
        user.id,
        VerificationCodeUseCaseEnum.LOG_IN_USER_WITH_PHONE_NUMBER,
      );

    this.smsService.sendLocalizedSms(
      user.phoneNumber as string,
      SmsMessageEnum.LOGIN_VERIFICATION_CODE,
      { code: verificationCode.code },
      user.favLang,
      SmsStrategyEnum.SMS,
    );

    return true;
  }

  async requestUpdateUserEmailVerificationCode(
    currentUser: User,
    input: RequestUpdateEmailVerificationCodeInput,
  ) {
    if (currentUser.role == UserRoleEnum.ADMIN)
      await this.adminGroupService.validateAdminGroupNotSuperAdmin(
        currentUser.adminGroupId,
      );

    if (currentUser.email == input.newEmail) {
      throw new AppHttpException(ErrorCodeEnum.EMAIL_ALREADY_EXIST);
    }

    await this.userService.validateUserWithVerifiedEmailDoesNotExist(
      input.newEmail,
    );

    const verificationCode =
      await this.userVerificationCodeService.createVerificationCode(
        currentUser.id,
        VerificationCodeUseCaseEnum.UPDATE_EMAIL,
        {
          newEmail: input.newEmail,
        },
      );

    this.mailService.sendEmailWithATemplate(
      input.newEmail,
      MailSubjectEnum.UPDATE_EMAIL_VERIFICATION_CODE,
      MailTemplateEnum.UPDATE_EMAIL_VERIFICATION_CODE,
      {
        code: verificationCode.code,
        appName: AppConfig.AppName,
      },
      currentUser.favLang,
    );

    return true;
  }

  async requestUpdateUserPhoneNumberVerificationCode(
    currentUser: User,
    input: RequestUpdatePhoneNumberVerificationCodeInput,
  ) {
    if (currentUser.phoneNumber == input.newPhoneNumber) {
      throw new AppHttpException(ErrorCodeEnum.VERIFIED_PHONE_NUMBER_EXIST);
    }

    await this.userService.validateUserWithVerifiedEmailDoesNotExist(
      input.newPhoneNumber,
    );

    const verificationCode =
      await this.userVerificationCodeService.createVerificationCode(
        currentUser.id,
        VerificationCodeUseCaseEnum.UPDATE_PHONE_NUMBER,
        {
          newPhoneNumber: input.newPhoneNumber,
        },
      );

    this.smsService.sendLocalizedSms(
      input.newPhoneNumber,
      SmsMessageEnum.UPDATE_PHONE_NUMBER,
      {
        code: verificationCode.code,
      },
      currentUser.favLang,
      input.smsStrategy,
    );

    return true;
  }

  async requestResetUserPasswordVerificationCode(
    input: RequestResetUserPasswordVerificationCodeInput,
  ) {
    const user =
      await this.userService.validateUserWithVerifiedEmailOrPhoneNumberExist(
        input.emailOrPhoneNumber,
      );

    if (
      input.verificationCodeStrategy == VerificationCodeStrategyEnum.EMAIL &&
      !user.isVerifiedEmail
    )
      throw new AppHttpException(
        ErrorCodeEnum.USER_DOES_NOT_HAVE_VERIFIED_EMAIL,
      );

    if (
      input.verificationCodeStrategy ==
        VerificationCodeStrategyEnum.PHONE_NUMBER &&
      !user.isVerifiedPhoneNumber
    )
      throw new AppHttpException(
        ErrorCodeEnum.USER_DOES_NOT_HAVE_VERIFIED_PHONE_NUMBER,
      );

    const verificationCode =
      await this.userVerificationCodeService.createVerificationCode(
        user.id,
        VerificationCodeUseCaseEnum.PASSWORD_RESET,
      );

    if (
      input.verificationCodeStrategy == VerificationCodeStrategyEnum.EMAIL ||
      (!input.verificationCodeStrategy && user.isVerifiedEmail)
    ) {
      this.mailService.sendEmailWithATemplate(
        user.email as string,
        MailSubjectEnum.RESET_USER_PASSWORD,
        MailTemplateEnum.RESET_USER_PASSWORD,
        {
          code: verificationCode.code,
          appName: AppConfig.AppName,
        },
        user.favLang,
      );
    } else if (
      input.verificationCodeStrategy ==
        VerificationCodeStrategyEnum.PHONE_NUMBER ||
      (!input.verificationCodeStrategy && user.isVerifiedPhoneNumber)
    ) {
      this.smsService.sendLocalizedSms(
        user.phoneNumber as string,
        SmsMessageEnum.RESET_PASSWORD_CODE,
        { code: verificationCode.code },
        user.favLang,
        input.smsStrategy,
      );
    }
    return true;
  }
}
