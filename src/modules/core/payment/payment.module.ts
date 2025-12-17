import { Module } from '@nestjs/common';
import { PaymentService } from './services/payment.service';
import { StripeStrategy } from './strategies/stripe.strategy';
import { PaymentController } from './controllers/payment.controller';
import { ConfigService } from '@nestjs/config';
import { AppDatabaseModule } from '../app-database/app-database.module';
import { Payment } from './entities/payment.entity';
import { Order } from 'src/modules/app/orders/entities/order.entity';
import { WalletModule } from 'src/modules/app/wallet/wallet.module';
import { OrderItem } from 'src/modules/app/orders/entities/order-item.entity';
import { Refund } from './entities/refund.entity';

@Module({
  imports: [
    AppDatabaseModule.forFeature([Payment, Order, OrderItem, Refund]),
    WalletModule,
  ],
  providers: [
    PaymentService,
    StripeStrategy,
    {
      provide: 'STRIPE_CLIENT',
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return require('stripe')(
          configService.getOrThrow<string>('STRIPE_SECRET_KEY'),
        );
      },
    },
  ],
  controllers: [PaymentController],
  exports: [PaymentService],
})
export class PaymentModule {}
