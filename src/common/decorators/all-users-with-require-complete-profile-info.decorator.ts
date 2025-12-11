import { SetMetadata } from '@nestjs/common';

export const ALLOW_USERS_WITH_REQUIRE_COMPLETE_PROFILE_INFO =
  'allowUsersWithRequireCompleteProfileInfo';

export const AllowUsersWithRequireCompleteProfileInfo = (allow: boolean) =>
  SetMetadata(ALLOW_USERS_WITH_REQUIRE_COMPLETE_PROFILE_INFO, allow);
