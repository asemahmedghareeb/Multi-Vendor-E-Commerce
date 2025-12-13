import { registerEnumType } from '@nestjs/graphql';

//TODO: Add user-roles here
export enum UserRoleEnum {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

registerEnumType(UserRoleEnum, {
  name: 'UserRoleEnum',
});
