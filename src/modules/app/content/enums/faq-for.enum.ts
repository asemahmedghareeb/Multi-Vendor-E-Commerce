import { registerEnumType } from '@nestjs/graphql';

export enum FaqForEnum {
  ALL = 'ALL',
  USER = 'USER',
  ADMIN = 'ADMIN',
}

registerEnumType(FaqForEnum, {
  name: 'FaqForEnum',
  description: 'The different types of FAQ visibility',
});
