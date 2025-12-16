import { Args, Query, Resolver } from '@nestjs/graphql';
import { WalletTransactionService } from '../services/transactions.service';
import { WalletTransaction } from '../entities/wallet-transaction.entity';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { User } from '../../auth-base/user/entities/user.entity';
import { PaginatorInput } from 'src/common/dtos/inputs/paginator.input';
import { Auth } from 'src/common/decorators/auth.decorator';


@Resolver(WalletTransaction)
export class WalletTransactionResolver {
  constructor(private readonly transactionService: WalletTransactionService) {}

  @Auth()
  @Query(() => [WalletTransaction])
  async walletTransactions(
    @Args('pagination') input: PaginatorInput,
    @CurrentUser() user: User,
  ) {
    return this.transactionService.walletTransactions(user, input);
  }
}
