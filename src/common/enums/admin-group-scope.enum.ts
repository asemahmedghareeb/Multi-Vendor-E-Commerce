import { registerEnumType } from '@nestjs/graphql';

export enum AdminGroupScopeEnum {
  GLOBAL = 'GLOBAL',
  PRODUCT = 'PRODUCT',
  //   TODO add needed scopes
}

registerEnumType(AdminGroupScopeEnum, {
  name: 'AdminGroupScopeEnum',
});
