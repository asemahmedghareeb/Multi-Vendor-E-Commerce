import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ROLES_KEY } from 'src/common/decorators/allowed-roles.decorator';
import { PERMISSIONS_KEY } from 'src/common/decorators/permissions.decorator';
import { UserRoleEnum } from 'src/common/enums/user-role.enum';
import { AppGqlContext } from '../types/gql-context.type';
import { AppHttpException } from '../exceptions/app-http.exception';
import { ErrorCodeEnum } from '../enums/error-code.enum';
import { GuardHelperService } from 'src/modules/core/app-helper/services/guard-helper.service';
import { PermissionOptions } from '../types/allowed-permission.type';
import { ALLOW_USERS_WITH_REQUIRE_SETTING_PASSWORD } from '../decorators/allow-users-with-require-setting-password.decorator';
import { ALLOW_USERS_WITH_REQUIRE_COMPLETE_PROFILE_INFO } from '../decorators/all-users-with-require-complete-profile-info.decorator';

@Injectable()
export class AuthorizedGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly guardHelperService: GuardHelperService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const allowedRoles = this.reflector.getAllAndOverride<UserRoleEnum[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    const requiredPermissions = this.reflector.getAllAndOverride<
      PermissionOptions[]
    >(PERMISSIONS_KEY, [context.getHandler(), context.getClass()]);

    const allowUsersWithRequireSettingPassword =
      this.reflector.getAllAndOverride<boolean>(
        ALLOW_USERS_WITH_REQUIRE_SETTING_PASSWORD,
        [context.getHandler(), context.getClass()],
      );

    const allowUsersWithRequireCompleteProfileInfo =
      this.reflector.getAllAndOverride<boolean>(
        ALLOW_USERS_WITH_REQUIRE_COMPLETE_PROFILE_INFO,
        [context.getHandler(), context.getClass()],
      );

    const ctx = GqlExecutionContext.create(
      context,
    )?.getContext() as AppGqlContext;

    if (ctx.accessTokenExpiredAt) {
      this.guardHelperService.validateIsExpiredSession(
        ctx.accessTokenExpiredAt,
      );
    }
    const currentUser = ctx.currentUser;

    if (!currentUser || currentUser.isBlocked)
      throw new AppHttpException(ErrorCodeEnum.UNAUTHORIZED);

    if (
      currentUser.requireSettingPassword &&
      !allowUsersWithRequireSettingPassword
    ) {
      throw new AppHttpException(ErrorCodeEnum.PASSWORD_RESET_REQUIRED);
    }

    if (
      currentUser.requireCompleteProfileInfo &&
      !allowUsersWithRequireCompleteProfileInfo
    ) {
      throw new AppHttpException(ErrorCodeEnum.PROFILE_COMPLETION_REQUIRED);
    }

    if (allowedRoles?.length && !allowedRoles.includes(currentUser.role)) {
      throw new AppHttpException(ErrorCodeEnum.FORBIDDEN);
    }

    if (
      requiredPermissions?.length &&
      currentUser.role === UserRoleEnum.ADMIN
    ) {
      await this.guardHelperService.validateUserHasPermission(
        currentUser,
        requiredPermissions,
        new AppHttpException(ErrorCodeEnum.FORBIDDEN),
      );
    }
    return true;
  }
}
