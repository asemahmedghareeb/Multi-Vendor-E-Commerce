import { registerEnumType } from '@nestjs/graphql';

export enum PaymentGatewaysEnum {
  STRIPE = 'stripe',
  // MYFATOORAH = 'myfatoorah',
  // GEIDEA = 'geidea',
}

registerEnumType(PaymentGatewaysEnum, {
  name: 'PaymentGatewaysEnum',
});
