import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsResolver } from './payments.resolver';
import { Payment } from './entities/payment.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { PaymentsController } from './payments.controller';
import { Order } from 'src/orders/entities/order.entity';
import { WalletModule } from 'src/wallet/wallet.module';
import { Refund } from './entities/refund.entity';
import { RefundsService } from './refund.service';
import { OrderItem } from 'src/orders/entities/order-item.entity';
import { RefundsResolver } from './refund.resolver';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment, Order, Refund, OrderItem]),
    ConfigModule,
    WalletModule,
  ],
  providers: [
    PaymentsResolver,
    PaymentsService,
    RefundsService,
    RefundsResolver,
  ],
  exports: [PaymentsService],
  controllers: [PaymentsController],
})
export class PaymentsModule {}
