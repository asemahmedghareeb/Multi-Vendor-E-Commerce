import {
  Resolver,
  Query,
  Mutation,
  Args,
} from '@nestjs/graphql';

import { Wallet } from '../entities/wallet.entity';
import { WalletTransaction } from '../entities/wallet-transaction.entity';
import { WalletsService } from '../services/wallet.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { PayoutInput } from '../dtos/inputs/payout.input';
import { Auth } from 'src/common/decorators/auth.decorator';
import { UserRoleEnum } from 'src/common/enums/user-role.enum';
import { DefaultPermissionActionsEnum } from 'src/common/enums/default-permissions.enum';
import { User } from '../../auth-base/user/entities/user.entity';
import { Transactional } from 'typeorm-transactional';

@Resolver(() => Wallet)
export class WalletsResolver {
  constructor(private readonly walletsService: WalletsService) {}

  @Auth()
  @Query(() => Wallet, { name: 'myWallet', nullable: true })
  async myWallet(@CurrentUser() user: User) {
    return this.walletsService.getMyWallet(user.id);
  }

  @Mutation(() => WalletTransaction)
  @Auth({
    roles: [UserRoleEnum.ADMIN],
    permissions: [
      {
        action: DefaultPermissionActionsEnum.UPDATE,
        target: Wallet.permissionsTarget,
      },
    ],
  })
  @Transactional()
  async adminPayoutVendor(@Args('input') input: PayoutInput) {
    return this.walletsService.executePayout(input);
  }
}
