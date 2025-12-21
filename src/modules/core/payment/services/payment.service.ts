import { Injectable, Logger } from '@nestjs/common';
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
import { OrderItem } from 'src/modules/app/orders/entities/order-item.entity';
import { CreateRefundInput } from '../inputs/create-refund.input';
import { Refund } from '../entities/refund.entity';
import { WalletsService } from 'src/modules/app/wallet/services/wallet.service';
import { OrderStatus } from 'src/modules/app/orders/enum/order-status.enum';
import { PaymentStatusEnum } from '../enums/payment-status.enum';

@Injectable()
export class PaymentService {
  constructor(
    @InjectAppRepository(Payment)
    private readonly paymentRepository: AppRepository<Payment>,
    @InjectAppRepository(OrderItem)
    private readonly orderItemRepository: AppRepository<OrderItem>,
    @InjectAppRepository(Order)
    private readonly orderRepository: AppRepository<Order>,
    @InjectAppRepository(Refund)
    private readonly refundRepository: AppRepository<Refund>,
    private readonly walletsService: WalletsService,
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
      relations: ['order', 'order.items'],
    });

    if (!payment) throw new AppHttpException(ErrorCodeEnum.SERVER_SIDE_ERROR);

    const isNewSuccess =
      payment.paymentStatus !== PaymentStatusEnum.SUCCEEDED &&
      paymentInfo.status === PaymentStatusEnum.SUCCEEDED;

    if (payment.paymentStatus !== paymentInfo.status) {
      await this.paymentRepository.updateOneFromExistingModel(payment, {
        paymentStatus: paymentInfo.status,
      });
    }

    if (isNewSuccess && payment.order) {
      try {
        Logger.log('Processing order revenue...');
        await this.walletsService.processOrderRevenue(payment.order);
        Logger.log('Order revenue processed successfully.');
      } catch (error) {
        Logger.error('Error processing order revenue:', error);
        throw error;
      }
    }
  }

  //add the wallet logic here
  async RefundPaymentPartially(input: CreateRefundInput) {
    const { paymentId, items, reason } = input;
    const payment = await this.paymentRepository.findOneOrFail(
      {
        where: {
          id: paymentId,
        },
        relations: ['order'],
      },
      ErrorCodeEnum.PAYMENT_DOES_NOT_EXIST,
    );

    let totalRefundAmount = 0;
    const itemsToProcess: { orderItem: OrderItem; quantity: number }[] = [];

    for (const itemInput of items) {
      const orderItem = await this.orderItemRepository.findOneOrFail({
        where: {
          id: itemInput.orderItemId,
          order: { id: payment.order.id },
        },
        relations: ['product'],
      });

      if (itemInput.quantity > orderItem.quantity) {
        throw new AppHttpException(ErrorCodeEnum.BAD_REQUEST_EXCEPTION);
      }

      totalRefundAmount += orderItem.priceAtPurchase * itemInput.quantity;

      itemsToProcess.push({
        orderItem,
        quantity: itemInput.quantity,
      });
    }

    const paymentStrategyClass = paymentStrategies[payment.paymentGateway];
    const paymentStrategy =
      this.moduleRef.get<PaymentStrategy>(paymentStrategyClass);

    const stripeRefund = await paymentStrategy.refund(
      payment.externalId,
      totalRefundAmount,
    );

    const refund = this.refundRepository.create({
      payment,
      amount: totalRefundAmount,
      paymentRefundId: stripeRefund.id,
      reason: reason,
      status: stripeRefund.status,
    });
    await this.refundRepository.save(refund);

    payment.amountRefunded += totalRefundAmount;
    await this.paymentRepository.save(payment);

    for (const { orderItem } of itemsToProcess) {
      orderItem.status = OrderStatus.RETURNED;
      await this.orderItemRepository.save(orderItem);
    }

    await this.walletsService.refundSpecificItems(
      payment.order,
      itemsToProcess,
    );

    return refund;
  }

  async refundPayment(paymentId: string, reason?: string) {
    const payment = await this.paymentRepository.findOneOrFail({
      where: { id: paymentId },
      relations: ['order', 'order.items', 'order.items.product'],
    });

    if (payment.amountRefunded >= payment.amount) {
      throw new AppHttpException(ErrorCodeEnum.BAD_REQUEST_EXCEPTION);
    }

    const remainingAmountToRefund = payment.amount - payment.amountRefunded;

    const itemsToRefund = payment.order.items
      .filter((item) => item.refundedQuantity < item.quantity)
      .map((item) => ({
        orderItem: item,
        quantity: item.quantity - item.refundedQuantity,
      }));

    // if there are no items to refund, but the remaining amount to refund is greater than 0 (example shipping fee)
    if (itemsToRefund.length === 0 && remainingAmountToRefund > 0) {
      console.warn('Money remains but items are marked refunded');
    }

    const paymentStrategyClass = paymentStrategies[payment.paymentGateway];
    const paymentStrategy =
      this.moduleRef.get<PaymentStrategy>(paymentStrategyClass);

    const stripeRefund = await paymentStrategy.refund(
      payment.externalId,
      remainingAmountToRefund,
    );

    const refund = this.refundRepository.create({
      payment,
      amount: remainingAmountToRefund,
      paymentRefundId: stripeRefund.id,
      reason: reason || 'Full Refund (Remaining Balance)',
      status: stripeRefund.status,
    });
    await this.refundRepository.save(refund);

    payment.amountRefunded += remainingAmountToRefund;
    await this.paymentRepository.save(payment);

    await this.walletsService.refundSpecificItems(payment.order, itemsToRefund);

    return refund;
  }
}
