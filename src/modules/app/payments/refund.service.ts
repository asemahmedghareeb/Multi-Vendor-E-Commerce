import {
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { Refund } from './entities/refund.entity';
import { Payment } from './entities/payment.entity';
import { WalletsService } from 'src/wallet/wallet.service';
import { Transactional } from 'typeorm-transactional';
import { CreateRefundInput } from './entities/create-refund.input';
import { OrderItem } from 'src/orders/entities/order-item.entity';
import { OrderStatus } from 'src/orders/enum/order-status.enum';

@Injectable()
export class RefundsService {
  private stripe: Stripe;

  constructor(
    @InjectRepository(Refund) private refundRepo: Repository<Refund>,
    @InjectRepository(Payment) private paymentRepo: Repository<Payment>,
    @InjectRepository(OrderItem) private orderItemRepo: Repository<OrderItem>,
    private readonly walletsService: WalletsService,
    private configService: ConfigService,
  ) {
    this.stripe = new Stripe(
      this.configService.get('STRIPE_SECRET_KEY') as string,
      {
        apiVersion: '2025-11-17.clover',
      },
    );
  }

  @Transactional()
  async refundOrderItems(input: CreateRefundInput) {
    const { paymentId, items, reason } = input;

    const payment = await this.paymentRepo.findOne({
      where: { id: paymentId },
      relations: ['order'],
    });
    if (!payment) throw new BadRequestException('Payment not found');

    let totalRefundAmount = 0;
    const itemsToProcess: { orderItem: OrderItem; quantity: number }[] = [];

    for (const itemInput of items) {
      const orderItem = await this.orderItemRepo.findOne({
        where: {
          id: itemInput.orderItemId,
          order: { id: payment.order.id },
        },
        relations: ['product', 'vendor'],
      });

      if (!orderItem) {
        throw new BadRequestException(
          `Order Item ${itemInput.orderItemId} invalid`,
        );
      }

      if (itemInput.quantity > orderItem.quantity) {
        throw new BadRequestException(
          `Cannot refund more than purchased quantity`,
        );
      }

      totalRefundAmount += orderItem.priceAtPurchase * itemInput.quantity;

      itemsToProcess.push({
        orderItem,
        quantity: itemInput.quantity,
      });
    }

    let stripeRefund;
    try {
      stripeRefund = await this.stripe.refunds.create({
        payment_intent: payment.stripePaymentId,
        amount: totalRefundAmount,
        reason: 'requested_by_customer',
      });
    } catch (error) {
      throw new BadRequestException(`Stripe Refund Failed: ${error.message}`);
    }

    const refund = this.refundRepo.create({
      payment,
      amount: totalRefundAmount,
      stripeRefundId: stripeRefund.id,
      reason: reason,
      status: stripeRefund.status,
    });
    await this.refundRepo.save(refund);

    payment.amountRefunded += totalRefundAmount;
    await this.paymentRepo.save(payment);

    for (const { orderItem } of itemsToProcess) {
      orderItem.status = OrderStatus.RETURNED;
      await this.orderItemRepo.save(orderItem);
    }

    await this.walletsService.refundSpecificItems(
      payment.order,
      itemsToProcess,
    );

    return refund;
  }

  @Transactional()
  async refundFullPayment(paymentId: string, reason?: string) {
    const payment = await this.paymentRepo.findOne({
      where: { id: paymentId },
      relations: [
        'order',
        'order.items',
        'order.items.product',
        'order.items.vendor',
      ],
    });

    if (!payment) throw new BadRequestException('Payment not found');

    if (payment.amountRefunded >= payment.amount) {
      throw new BadRequestException('Payment is already fully refunded');
    }

    const remainingAmountToRefund = payment.amount - payment.amountRefunded;

    const itemsToRefund = payment.order.items
      .filter((item) => item.refundedQuantity < item.quantity)
      .map((item) => ({
        orderItem: item,
        quantity: item.quantity - item.refundedQuantity,
      }));

    if (itemsToRefund.length === 0 && remainingAmountToRefund > 0) {
      console.warn('Money remains but items are marked refunded');
    }

    let stripeRefund;
    try {
      stripeRefund = await this.stripe.refunds.create({
        payment_intent: payment.stripePaymentId,
        amount: remainingAmountToRefund,
        reason: 'requested_by_customer',
      });
    } catch (error) {
      throw new BadRequestException(`Stripe Refund Failed: ${error.message}`);
    }

    const refund = this.refundRepo.create({
      payment,
      amount: remainingAmountToRefund,
      stripeRefundId: stripeRefund.id,
      reason: reason || 'Full Refund (Remaining Balance)',
      status: stripeRefund.status,
    });
    await this.refundRepo.save(refund);

    payment.amountRefunded += remainingAmountToRefund;
    await this.paymentRepo.save(payment);

    await this.walletsService.refundSpecificItems(payment.order, itemsToRefund);

    return refund;
  }

  
}
