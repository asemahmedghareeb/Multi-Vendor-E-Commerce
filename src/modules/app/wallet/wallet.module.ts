import { Module } from '@nestjs/common';
import { Wallet } from './entities/wallet.entity';
import { WalletTransaction } from './entities/wallet-transaction.entity';
import { WalletsService } from './services/wallet.service';
import { OrderItem } from '../orders/entities/order-item.entity';
import { User } from '../auth-base/user/entities/user.entity';
import { Order } from '../orders/entities/order.entity';
import { AppDatabaseModule } from 'src/modules/core/app-database/app-database.module';
import { WalletsResolver } from './resolvers/wallet.resolver';

@Module({
  imports: [
    AppDatabaseModule.forFeature([
      Wallet,
      WalletTransaction,
      Order,
      User,
      OrderItem,
    ]),
  ],
  providers: [WalletsResolver, WalletsService],
  exports: [WalletsService],
})
export class WalletModule {}
