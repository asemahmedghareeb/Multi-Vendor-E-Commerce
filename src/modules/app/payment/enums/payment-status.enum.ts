import { registerEnumType } from '@nestjs/graphql';

export enum PaymentStatusEnum {
  INCOMPLETE = 'INCOMPLETE',
  SUCCEEDED = 'SUCCEEDED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

registerEnumType(PaymentStatusEnum, {
  name: 'PaymentStatusEnum',
});
