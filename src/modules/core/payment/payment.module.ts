import { Module } from '@nestjs/common';
import { PaymentService } from './services/payment.service';
import { StripeStrategy } from './strategies/stripe.strategy';
import { PaymentController } from './controllers/payment.controller';
import { ConfigService } from '@nestjs/config';
import { AppDatabaseModule } from '../app-database/app-database.module';
import { Payment } from './entities/payment.entity';

@Module({
  imports: [AppDatabaseModule.forFeature([Payment])],
  providers: [
    PaymentService,
    StripeStrategy,
    {
      provide: 'STRIPE_CLIENT',
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const stripe = require('stripe')(
          configService.getOrThrow<string>('STRIPE_SECRET_KEY'),
        );
        return stripe;
      },
    },
  ],
  controllers: [PaymentController],
  exports: [PaymentService],
})
export class PaymentModule {}
