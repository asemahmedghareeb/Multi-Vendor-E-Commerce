import { registerEnumType } from "@nestjs/graphql";

export enum TransactionType {
  DEPOSIT = 'DEPOSIT',
  SALE = 'SALE',
  COMMISSION = 'COMMISSION',
  PAYOUT = 'PAYOUT',
  REFUND = 'REFUND',
}

registerEnumType(TransactionType, { name: 'TransactionType' });