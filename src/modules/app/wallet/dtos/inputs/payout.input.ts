import { InputType, Field, Float } from '@nestjs/graphql';
import { IsUUID, IsNumber, Min } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { MoneyScalar } from 'src/common/scalars/money.scalar';

@InputType()
export class PayoutInput {
  @Field()
  @IsUUID('4')
  vendorId: string;

  @Field(() => MoneyScalar)
  @IsNumber()
  @Min(1)
  amount: number;
}
