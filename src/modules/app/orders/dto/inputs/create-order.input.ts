import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';
import { PaymentGatewaysEnum } from 'src/modules/core/payment/enums/payment-gateways.enum';

@InputType()
export class CreateOrderInput {
  @Field()
  @IsNotEmpty()
  // In a real app, you might use a nested object, but JSON string is fine for now
  @IsString() 
  shippingAddress: string; 

  @Field(() => PaymentGatewaysEnum)
  @IsNotEmpty()
  paymentGateway: PaymentGatewaysEnum;

}