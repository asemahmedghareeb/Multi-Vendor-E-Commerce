import { SetMetadata } from '@nestjs/common';
import { PermissionOptions } from '../types/allowed-permission.type';

export const PERMISSIONS_KEY = 'requiredPermissions';
export const RequiredPermissions = (...permissions: PermissionOptions[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
