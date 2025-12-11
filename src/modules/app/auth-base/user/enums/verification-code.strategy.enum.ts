import { registerEnumType } from '@nestjs/graphql';

export enum VerificationCodeStrategyEnum {
  EMAIL = 'EMAIL',
  PHONE_NUMBER = 'PHONE_NUMBER',
}

registerEnumType(VerificationCodeStrategyEnum, {
  name: 'VerificationCodeStrategyEnum',
});
