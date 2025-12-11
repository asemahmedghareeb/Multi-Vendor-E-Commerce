import { PermissionEnumType } from 'src/common/types/enum.type';

export enum AdminCustomPermissionActions {
  REGISTER_ADMIN = 'REGISTER_ADMIN',
}

export enum CustomPermissionsTargetsEnum {
  REGISTER_ADMIN = 'REGISTER_ADMIN',
}

export const CustomPermissions: {
  [key in CustomPermissionsTargetsEnum]: PermissionEnumType;
} = {
  REGISTER_ADMIN: AdminCustomPermissionActions,
};
