import { Injectable } from '@nestjs/common';
import { AppHelperService } from 'src/modules/core/app-helper/services/app-helper.service';
import { RegisterUserInput } from '../../../../../common/dtos/inputs/register-user.input';
import { AppRepository } from 'src/modules/core/app-database/repositories/app.repository';
import { User } from '../entities/user.entity';
import { InjectAppRepository } from 'src/common/decorators/inject-app-repository.decorator';
import { AppHttpException } from 'src/common/exceptions/app-http.exception';
import { ErrorCodeEnum } from 'src/common/enums/error-code.enum';
import { CodePrefixEnum } from 'src/modules/core/app-helper/enums/code-prefix.enum';
import { UserRoleEnum } from 'src/common/enums/user-role.enum';
import { AuthHelperService } from 'src/modules/core/app-helper/services/auth-helper.service';
import { ManualRegisterWithPasswordInput } from '../../auth/dtos/inputs/manual-register-user-with-password.input';
import { UserVerificationCodeService } from './user-verification-code.service';
import { SocialRegisterUserInput } from '../../auth/dtos/inputs/social-register-user.input';
import { LessThan } from 'typeorm';
import { UpdateUserInfo } from '../dtos/inputs/update-user-info.input';
import { RegisterAdminInput } from '../dtos/inputs/register-admin.input';
import { AdminGroup } from '../../admin-group/entities/admin-group.entity';
import { SUPER_ADMIN_GROUP_NAME } from '../../admin-group/consts/super-admin-group-name.const';
import { CompleteUserProfileInfoInput } from '../dtos/inputs/complete-user-profile-info.input';

@Injectable()
export class UserService {
  constructor(
    private readonly appHelper: AppHelperService,
    private readonly authHelper: AuthHelperService,
    private readonly userVerificationCodeService: UserVerificationCodeService,
    @InjectAppRepository(User)
    private readonly userRepository: AppRepository<User>,
    @InjectAppRepository(AdminGroup)
    private readonly adminGroupRepository: AppRepository<AdminGroup>,
  ) {}

  async validateUserWithIdExist(userId: string) {
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
    });
    if (!user) throw new AppHttpException(ErrorCodeEnum.USER_DOES_NOT_EXIST);
    return user;
  }

  async validateUserWithVerifiedEmailOrPhoneNumberExist(
    emailOrPhoneNumber: string,
  ) {
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
    });
    if (!user) throw new AppHttpException(ErrorCodeEnum.USER_DOES_NOT_EXIST);
    return user;
  }

  async validateUserWithVerifiedEmailExist(email: string) {
    const user = await this.userRepository.findOne({
      where: {
        email,
        isVerifiedEmail: true,
      },
    });
    if (!user) throw new AppHttpException(ErrorCodeEnum.USER_DOES_NOT_EXIST);
    return user;
  }

  async validateUserWithVerifiedEmailDoesNotExist(email: string) {
    const user = await this.userRepository.findOne({
      where: {
        email,
        isVerifiedEmail: true,
      },
    });
    if (user) throw new AppHttpException(ErrorCodeEnum.VERIFIED_EMAIL_EXIST);
    return user;
  }

  async validateUserWithVerifiedPhoneNumberExist(phoneNumber: string) {
    const user = await this.userRepository.findOne({
      where: {
        phoneNumber,
        isVerifiedPhoneNumber: true,
      },
    });
    if (!user) throw new AppHttpException(ErrorCodeEnum.USER_DOES_NOT_EXIST);
    return user;
  }

  async validateUserWithVerifiedPhoneNumberDoesNotExist(phoneNumber: string) {
    const user = await this.userRepository.findOne({
      where: {
        phoneNumber,
        isVerifiedPhoneNumber: true,
      },
    });
    if (user)
      throw new AppHttpException(ErrorCodeEnum.VERIFIED_PHONE_NUMBER_EXIST);
    return user;
  }

  async verifyUserRegistrationEligibility(
    input: RegisterUserInput | SocialRegisterUserInput,
  ) {
    const users = await this.userRepository.find({
      where: [
        {
          email: input.email,
        },
        {
          phoneNumber: input.phoneNumber,
        },
      ],
    });

    for (const user of users) {
      if (user.isVerifiedPhoneNumber && user.phoneNumber == input.phoneNumber)
        throw new AppHttpException(ErrorCodeEnum.VERIFIED_PHONE_NUMBER_EXIST);

      if (user.isVerifiedEmail && user.email == input.email)
        throw new AppHttpException(ErrorCodeEnum.VERIFIED_EMAIL_EXIST);
    }

    return true;
  }

  async registerUser(
    input: ManualRegisterWithPasswordInput | SocialRegisterUserInput,
    role: UserRoleEnum,
    isVerifiedEmail: boolean,
    isVerifiedPhoneNumber: boolean,
    requireSettingPassword?: boolean,
    adminGroupId?: string,
  ) {
    if (adminGroupId && role != UserRoleEnum.ADMIN) {
      throw new AppHttpException(ErrorCodeEnum.SERVER_SIDE_ERROR);
    }
    if (isVerifiedEmail && !input.email) {
      throw new AppHttpException(ErrorCodeEnum.BAD_REQUEST_EXCEPTION);
    }
    const user = await this.userRepository.createOne({
      ...input,
      code: await this.appHelper.generateEntityCodeWithPrefix(
        CodePrefixEnum.USER,
        this.userRepository,
      ),
      role,
      password:
        'password' in input && input.password
          ? await this.authHelper.hashPassword(input?.password)
          : undefined,
      isVerifiedEmail,
      isVerifiedPhoneNumber,
      adminGroupId,
      requireSettingPassword,
      requireCompleteProfileInfo: !input.firstName || !input.lastName,
    });

    return user;
  }

  async updateUserPassword(user: User, newPassword: string) {
    return this.userRepository.updateOneFromExistingModel(user, {
      password: await this.authHelper.hashPassword(newPassword),
      requireSettingPassword: false,
    });
  }

  async updateUserInfo(user: User, input: UpdateUserInfo) {
    await this.userRepository.updateOneFromExistingModel(user, input);
    return true;
  }

  async completeUserProfileInfo(
    user: User,
    input: CompleteUserProfileInfoInput,
  ) {
    if (!user.requireCompleteProfileInfo)
      throw new AppHttpException(ErrorCodeEnum.BAD_REQUEST_EXCEPTION, {
        message: 'user profile is completed',
      });

    await this.userRepository.updateOneFromExistingModel(user, {
      requireCompleteProfileInfo: false,
      ...input,
      isVerifiedEmail: !!!input.email,
    });

    return true;
  }

  async createAdminUser(input: RegisterAdminInput) {
    await this.verifyUserRegistrationEligibility(input);

    const adminGroup = await this.adminGroupRepository.findOne({
      where: {
        id: input.adminGroupId,
      },
    });

    if (!adminGroup)
      throw new AppHttpException(ErrorCodeEnum.ADMIN_GROUP_DOES_NOT_EXIST);

    if (adminGroup.name == SUPER_ADMIN_GROUP_NAME)
      throw new AppHttpException(ErrorCodeEnum.FORBIDDEN, {
        message: 'Only one superAdmin is allowed to exist in the whole app',
      });

    await this.registerUser(
      input,
      UserRoleEnum.ADMIN,
      true,
      true,
      true,
      adminGroup.id,
    );

    return true;
  }

  async removeUnVerifiedUsers() {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

    const unverifiedUsers = await this.userRepository.find({
      where: {
        isVerifiedEmail: false,
        isVerifiedPhoneNumber: false,
        createdAt: LessThan(twoHoursAgo),
      },
    });

    if (!unverifiedUsers.length) return;

    await this.userRepository.remove(unverifiedUsers);
  }
}
