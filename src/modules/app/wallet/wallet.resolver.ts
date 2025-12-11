import {
  Resolver,
  Query,
  ResolveField,
  Parent,
  Mutation,
  Args,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Wallet } from './entities/wallet.entity';
import { WalletTransaction } from './entities/wallet-transaction.entity';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { WalletsService } from './wallet.service';
import { WalletTransactionsLoader } from 'src/dataLoaders/wallet-transactions.loader';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { PayoutInput } from './entities/payout.input';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/guards/role.enum';
@Resolver(() => Wallet)
export class WalletsResolver {
  constructor(
    private readonly walletsService: WalletsService,
    private readonly walletTransactionsLoader: WalletTransactionsLoader,
  ) {}

  @Query(() => Wallet, { name: 'myWallet', nullable: true })
  @UseGuards(AuthGuard)
  async myWallet(@CurrentUser() user: { userId: string }) {
    return this.walletsService.getMyWallet(user.userId);
  }

  @Mutation(() => WalletTransaction)
  @Roles(Role.SUPER_ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  async adminPayoutVendor(@Args('input') input: PayoutInput) {
    return this.walletsService.executePayout(input);
  }

  @ResolveField(() => [WalletTransaction])
  async transactions(@Parent() wallet: Wallet) {
    return this.walletTransactionsLoader.byWalletId.load(wallet.id);
  }
}
