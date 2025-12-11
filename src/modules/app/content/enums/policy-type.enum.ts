import { registerEnumType } from '@nestjs/graphql';

export enum PolicyTypeEnum {
  TERMS = 'TERMS',
  PRIVACY = 'PRIVACY',
  REFUND = 'REFUND',
  CUSTOM = 'CUSTOM',
}

registerEnumType(PolicyTypeEnum, {
  name: 'PolicyTypeEnum',
});
//TODO change based on business logic
