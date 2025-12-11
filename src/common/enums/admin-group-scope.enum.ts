import { registerEnumType } from '@nestjs/graphql';

export enum AdminGroupScopeEnum {
  GLOBAL = 'GLOBAL',
  //   TODO add needed scopes
}

registerEnumType(AdminGroupScopeEnum, {
  name: 'AdminGroupScopeEnum',
});
