import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { AuthorizedGuard } from '../guards/authorized.guard';
import { ROLES_KEY } from './allowed-roles.decorator';
import { PERMISSIONS_KEY } from './permissions.decorator';
import { AuthOptions } from '../types/auth-options.type';
import { ALLOW_USERS_WITH_REQUIRE_SETTING_PASSWORD } from './allow-users-with-require-setting-password.decorator';
import { ALLOW_USERS_WITH_REQUIRE_COMPLETE_PROFILE_INFO } from './all-users-with-require-complete-profile-info.decorator';

export function Auth(options: AuthOptions = {}) {
  const {
    roles = [],
    permissions = [],
    allowUsersWithRequireSettingPassword = false,
    allowUsersWithRequireCompleteProfileInfo = false,
  } = options;

  return applyDecorators(
    UseGuards(AuthorizedGuard),
    ...(roles.length ? [SetMetadata(ROLES_KEY, roles)] : []),
    ...(permissions.length ? [SetMetadata(PERMISSIONS_KEY, permissions)] : []),
    SetMetadata(
      ALLOW_USERS_WITH_REQUIRE_SETTING_PASSWORD,
      allowUsersWithRequireSettingPassword,
    ),
    SetMetadata(
      ALLOW_USERS_WITH_REQUIRE_COMPLETE_PROFILE_INFO,
      allowUsersWithRequireCompleteProfileInfo,
    ),
  );
}
