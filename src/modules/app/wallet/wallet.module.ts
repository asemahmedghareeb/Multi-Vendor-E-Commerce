import { Module } from '@nestjs/common';
import { Wallet } from './entities/wallet.entity';
import { WalletTransaction } from './entities/wallet-transaction.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalletsService } from './wallet.service';
import { Order } from 'src/orders/entities/order.entity';
import { User } from 'src/users/entities/user.entity';
import { WalletsResolver } from './wallet.resolver';
import { OrderItem } from 'src/orders/entities/order-item.entity';
import { Vendor } from 'src/vendors/entities/vendor.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Wallet,
      WalletTransaction,
      Order,
      User,
      OrderItem,
      Vendor,
    ]),
  ],
  providers: [WalletsResolver, WalletsService],
  exports: [WalletsService],
})
export class WalletModule {}
