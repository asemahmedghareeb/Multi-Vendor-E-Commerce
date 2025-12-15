import { registerEnumType } from '@nestjs/graphql';

export enum AdminGroupScopeEnum {
  GLOBAL = 'GLOBAL',
  PRODUCTS_AND_ORDERS = 'PRODUCTS_AND_ORDERS',
  //   TODO add needed scopes
}

registerEnumType(AdminGroupScopeEnum, {
  name: 'AdminGroupScopeEnum',
});
