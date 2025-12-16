import { registerEnumType } from '@nestjs/graphql';

//TODO: Add user-roles here
export enum UserRoleEnum {
  ADMIN = 'ADMIN',
  USER = 'USER',
  VENDOR = 'VENDOR',
}

registerEnumType(UserRoleEnum, {
  name: 'UserRoleEnum',
});
