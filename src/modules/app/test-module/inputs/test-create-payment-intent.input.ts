import { ArgsType, Field } from '@nestjs/graphql';
import { MoneyScalar } from 'src/common/scalars/money.scalar';

@ArgsType()
export class TestCreatePaymentIntent {
  @Field(() => MoneyScalar)
  amount: number;
}
