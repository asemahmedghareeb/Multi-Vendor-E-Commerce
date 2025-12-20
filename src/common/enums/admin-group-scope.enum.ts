import { registerEnumType } from '@nestjs/graphql';

export enum AdminGroupScopeEnum {
  GLOBAL = 'GLOBAL',
  VENDORS = 'VENDOR',
  USERS = 'USER',
  PRODUCTS = 'PRODUCTS',
  ORDERS = 'ORDERS',
  //   TODO add needed scopes
}

registerEnumType(AdminGroupScopeEnum, {
  name: 'AdminGroupScopeEnum',
});
