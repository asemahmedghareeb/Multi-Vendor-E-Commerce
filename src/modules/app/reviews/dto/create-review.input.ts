import { InputType, Field, Int } from '@nestjs/graphql';
import { IsString, IsNotEmpty, Min, Max, IsUUID } from 'class-validator';

@InputType()
export class CreateReviewInput {
  @Field()
  @IsUUID()
  vendorId: string;

  @Field()
  @IsUUID()
  orderId: string;

  @Field(() => Int)
  @Min(1)
  @Max(5)
  rating: number;

  @Field()
  @IsString()
  @IsNotEmpty()
  comment: string;
}