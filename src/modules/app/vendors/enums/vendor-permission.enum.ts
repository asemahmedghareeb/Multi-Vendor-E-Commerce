import { DefaultPermissionActionsEnum } from 'src/common/enums/default-permissions.enum';

export enum VendorPermissionExtraActionsEnum {
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
}

export const VendorPermissionActionsEnum = {
  ...DefaultPermissionActionsEnum,
  ...VendorPermissionExtraActionsEnum,
};

export type VendorPermissionActionsEnum =
  (typeof VendorPermissionActionsEnum)[keyof typeof VendorPermissionActionsEnum];
