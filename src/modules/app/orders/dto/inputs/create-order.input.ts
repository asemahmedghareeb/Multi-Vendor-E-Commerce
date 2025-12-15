import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsJSON } from 'class-validator';

@InputType()
export class CreateOrderInput {
  @Field()
  @IsNotEmpty()
  // In a real app, you might use a nested object, but JSON string is fine for now
  @IsString() 
  shippingAddress: string; 
}