import { SetMetadata } from '@nestjs/common';
import { UserRoleEnum } from '../enums/user-role.enum';

export const ROLES_KEY = 'roles';
export const AllowedRoles = (...roles: UserRoleEnum[]) =>
  SetMetadata(ROLES_KEY, roles);
 