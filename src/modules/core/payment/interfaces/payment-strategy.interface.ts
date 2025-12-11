import { CurrenciesEnum } from 'src/common/enums/currency.enum';
import { PaymentIntent } from '../types/payment-intent.type';
import { PaymentInfo } from '../types/payment-info.type';
import { Request } from 'express';

export interface PaymentStrategy {
  createPaymentIntent(
    amount: number,
    currency: CurrenciesEnum,
    metadata: any,
  ): Promise<PaymentIntent>;

  handlePaymentWebhook(
    body: object,
    req?: Request,
  ): Promise<PaymentInfo | void>;

  refund(externalId: string): Promise<void>;
}
