import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { Refund } from '../entities/refund.entity';
import { CreateRefundInput } from '../inputs/create-refund.input';
import { Transactional } from 'typeorm-transactional';
import { PaymentService } from '../services/payment.service';
import { Auth } from 'src/common/decorators/auth.decorator';
import { UserRoleEnum } from 'src/common/enums/user-role.enum';

@Resolver(() => Refund)
export class RefundsResolver {
  constructor(private readonly paymentsService: PaymentService) {}

  @Auth({
    roles: [UserRoleEnum.USER],
  })
  @Mutation(() => Refund)
  @Transactional()
  async refundItems(@Args('input') input: CreateRefundInput) {
    return this.paymentsService.RefundPaymentPartially(input);
  }

  @Auth({ roles: [UserRoleEnum.ADMIN] })
  @Mutation(() => Refund)
  @Transactional()
  async refundFullOrder(
    @Args('paymentId') paymentId: string,
    @Args('reason', { nullable: true }) reason?: string,
  ) {
    return this.paymentsService.refundPayment(paymentId, reason);
  }
}
