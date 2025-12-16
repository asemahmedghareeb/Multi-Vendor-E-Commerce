import { Injectable } from '@nestjs/common';
import { InjectAppRepository } from 'src/common/decorators/inject-app-repository.decorator';
import { Payment } from '../entities/payment.entity';
import { AppRepository } from '../../app-database/repositories/app.repository';
import { CurrenciesEnum } from 'src/common/enums/currency.enum';
import { ModuleRef } from '@nestjs/core';
import { PaymentGatewaysEnum } from '../enums/payment-gateways.enum';
import { paymentStrategies } from '../strategies';
import { PaymentStrategy } from '../interfaces/payment-strategy.interface';
import { User } from 'src/modules/app/auth-base/user/entities/user.entity';
import { Request } from 'express';
import { AppHttpException } from 'src/common/exceptions/app-http.exception';
import { ErrorCodeEnum } from 'src/common/enums/error-code.enum';
import { Order } from 'src/modules/app/orders/entities/order.entity';

@Injectable()
export class PaymentService {
  constructor(
    @InjectAppRepository(Payment)
    private readonly paymentRepository: AppRepository<Payment>,
    @InjectAppRepository(Order)
    private readonly moduleRef: ModuleRef,
  ) {}

  async createPaymentIntent(
    paymentGateway: PaymentGatewaysEnum,
    amount: number,
    currency: CurrenciesEnum,
    metadata: any,
    user: User,
    // orderId?: string,
    order: Order,
  ) {
    const paymentStrategyClass = paymentStrategies[paymentGateway];
    const paymentStrategy =
      this.moduleRef.get<PaymentStrategy>(paymentStrategyClass);

    const paymentIntent = await paymentStrategy.createPaymentIntent(
      amount,
      currency,
      metadata,
    );

    paymentIntent.clientSecret;

    const payment = await this.paymentRepository.createOne({
      paymentGateway,
      externalId: paymentIntent.id,
      amount,
      currency,
      metadata,
      user,
      order,
      // ...(orderId && { orderId }),
    });

    payment.clientSecret = paymentIntent.clientSecret;

    return payment;
  }

  async handlePaymentWebhook(
    paymentGateway: PaymentGatewaysEnum,
    req: Request,
  ) {
    const paymentStrategyClass = paymentStrategies[paymentGateway];
    const paymentStrategy =
      this.moduleRef.get<PaymentStrategy>(paymentStrategyClass);

    const paymentInfo = await paymentStrategy.handlePaymentWebhook(req);

    if (!paymentInfo)
      throw new AppHttpException(ErrorCodeEnum.SERVER_SIDE_ERROR);

    const payment = await this.paymentRepository.findOne({
      where: {
        externalId: paymentInfo.externalId,
      },
    });

    if (!payment) throw new AppHttpException(ErrorCodeEnum.SERVER_SIDE_ERROR);

    await this.paymentRepository.updateOneFromExistingModel(payment, {
      paymentStatus: paymentInfo.status,
    });
  }
  //add the wallet logic here
  async refundPayment(paymentId: string) {
    const payment = await this.paymentRepository.findOneOrFail(
      {
        where: {
          id: paymentId,
        },
      },
      ErrorCodeEnum.PAYMENT_DOES_NOT_EXIST,
    );

    const paymentStrategyClass = paymentStrategies[payment.paymentGateway];
    const paymentStrategy =
      this.moduleRef.get<PaymentStrategy>(paymentStrategyClass);

    await paymentStrategy.refund(payment.externalId);
  }

  async RefundPaymentPartially(paymentId: string, amount: number) {
    const payment = await this.paymentRepository.findOneOrFail(
      {
        where: {
          id: paymentId,
        },
      },
      ErrorCodeEnum.PAYMENT_DOES_NOT_EXIST,
    );

    const paymentStrategyClass = paymentStrategies[payment.paymentGateway];
    const paymentStrategy =
      this.moduleRef.get<PaymentStrategy>(paymentStrategyClass);

    await paymentStrategy.refund(payment.externalId, amount);
  }
}
