import { registerEnumType } from '@nestjs/graphql';

export enum UsersActivitySortByEnum {
  CREATED_AT = 'CREATED_AT',
}

registerEnumType(UsersActivitySortByEnum, {
  name: 'UsersActivitySortByEnum',
});
