import { registerEnumType } from '@nestjs/graphql';

//TODO: Add user-roles here
export enum UserRoleEnum {
  ADMIN = 'ADMIN',
  USER = 'USER',
  VENDOR = 'VENDOR',
  SUPER_ADMIN = 'SUPER_ADMIN',
  CLIENT = 'CLIENT',
}

registerEnumType(UserRoleEnum, {
  name: 'UserRoleEnum',
});
