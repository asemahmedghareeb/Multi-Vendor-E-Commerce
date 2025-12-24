import { PaymentStatusEnum } from '../enums/payment-status.enum';

export type PaymentInfo = {
  status: PaymentStatusEnum;
  externalId: string;
};
