import { Field, InputType } from '@nestjs/graphql';
import { IsEnum, IsString } from 'class-validator';
import { OrderStatus } from '../../enum/order-status.enum';

@InputType()
export class UpdateOrderStatusInput {
  @Field()
  @IsString()
  orderId: string;

  @Field(() => OrderStatus)
  @IsEnum(OrderStatus)
  status: OrderStatus;
}
