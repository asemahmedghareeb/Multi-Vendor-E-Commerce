import { SetMetadata } from '@nestjs/common';

export const ALLOW_USERS_WITH_REQUIRE_SETTING_PASSWORD =
  'allowUsersWithRequireSettingPassword';
  
export const AllowUsersWithRequireSettingPassword = (allow: boolean) =>
  SetMetadata(ALLOW_USERS_WITH_REQUIRE_SETTING_PASSWORD, allow);
