import { UserRoleEnum } from '../enums/user-role.enum';
import { PermissionOptions } from './allowed-permission.type';

export type AuthOptions = {
  roles?: UserRoleEnum[];
  permissions?: PermissionOptions[];
  allowUsersWithRequireSettingPassword?: boolean;
  allowUsersWithRequireCompleteProfileInfo?: boolean;
};
