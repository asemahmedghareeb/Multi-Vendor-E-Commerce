import { InputType, Field, Float } from '@nestjs/graphql';
import { IsUUID, IsNumber, Min } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

@InputType()
export class PayoutInput {
  @Field()
  @IsUUID('4')
  vendorId: string;

  @Field(() => Float)
  @IsNumber()
  @Min(1)
  amount: number;
}
