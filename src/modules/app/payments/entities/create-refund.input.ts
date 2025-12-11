import { InputType, Field, Int } from '@nestjs/graphql';
import { IsUUID, IsInt, Min, IsOptional, IsString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

@InputType()
export class RefundItemInput {
  @Field()
  @IsUUID()
  orderItemId: string;

  @Field(() => Int)
  @IsInt()
  @Min(1)
  quantity: number;
}

@InputType()
export class CreateRefundInput {
  @Field()
  @IsUUID()
  paymentId: string;

  @Field(() => [RefundItemInput])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RefundItemInput)
  items: RefundItemInput[];

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  reason?: string;
}