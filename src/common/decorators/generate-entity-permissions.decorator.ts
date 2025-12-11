import { DefaultPermissionActionsEnum } from '../enums/default-permissions.enum';
import { PermissionEnumType } from '../types/enum.type';

export function GeneratePermissions(permissionEnum?: PermissionEnumType) {
  return function <T extends { new (...args: any[]): {} }>(constructor: T) {
    Object.defineProperty(constructor, 'permissionActionsEnum', {
      get: function () {
        return permissionEnum || DefaultPermissionActionsEnum;
      },
    });
    return constructor;
  };
}
