import { Type } from '@nestjs/common';
import { PaymentGatewaysEnum } from '../enums/payment-gateways.enum';
import { PaymentStrategy } from '../interfaces/payment-strategy.interface';
import { StripeStrategy } from './stripe.strategy';

export const paymentStrategies: {
  [key in PaymentGatewaysEnum]: Type<PaymentStrategy>;
} = {
  stripe: StripeStrategy,
};
