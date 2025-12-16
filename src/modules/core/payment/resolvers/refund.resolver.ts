import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { Refund } from '../entities/refund.entity';
import { CreateRefundInput } from '../inputs/create-refund.input';
import { Transactional } from 'typeorm-transactional';
import { PaymentService } from '../services/payment.service';


@Resolver(() => Refund)
export class RefundsResolver {
  constructor(private readonly paymentsService: PaymentService) {}

  @Mutation(() => Refund)
  @Transactional()
  async refundItems(@Args('input') input: CreateRefundInput) {
    // return this.paymentsService.RefundPaymentPartially();
  }

  @Mutation(() => Refund)
  @Transactional()
  async refundFullOrder(
    @Args('paymentId') paymentId: string,
    @Args('reason', { nullable: true }) reason?: string,
  ): Promise<void> {
    return this.paymentsService.refundPayment(paymentId);
  }
}
