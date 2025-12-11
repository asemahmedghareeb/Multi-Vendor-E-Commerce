import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Refund } from './entities/refund.entity';
import { RefundsService } from './refund.service';
import { Role } from 'src/auth/guards/role.enum';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { CreateRefundInput } from './entities/create-refund.input';

@Resolver(() => Refund)
export class RefundsResolver {
  constructor(private readonly refundsService: RefundsService) {}

  @Mutation(() => Refund)
  @Roles(Role.SUPER_ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  async refundItems(@Args('input') input: CreateRefundInput): Promise<Refund> {
    return this.refundsService.refundOrderItems(input);
  }


  @Mutation(() => Refund)
  @Roles(Role.SUPER_ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  async refundFullOrder(
    @Args('paymentId') paymentId: string,
    @Args('reason', { nullable: true }) reason?: string,
  ): Promise<Refund> {
    return this.refundsService.refundFullPayment(paymentId, reason);
  }
}
