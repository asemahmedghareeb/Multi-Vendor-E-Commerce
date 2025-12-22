import { InputType, Field } from '@nestjs/graphql';
import { IsJSON, IsNotEmpty, IsString } from 'class-validator';
import { PaymentGatewaysEnum } from 'src/modules/core/payment/enums/payment-gateways.enum';

@InputType()
export class CreateOrderInput {
  @Field()
  @IsNotEmpty()
  // @IsJSON()
  @IsString() 
  shippingAddress: string; 

  @Field(() => PaymentGatewaysEnum)
  @IsNotEmpty()
  paymentGateway: PaymentGatewaysEnum;

}