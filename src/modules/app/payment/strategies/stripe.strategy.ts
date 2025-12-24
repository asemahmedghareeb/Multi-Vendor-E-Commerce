import { Inject, Logger } from '@nestjs/common';
import { PaymentStrategy } from '../interfaces/payment-strategy.interface';
import Stripe from 'stripe';
import { CurrenciesEnum } from 'src/common/enums/currency.enum';
import { AppHttpException } from 'src/common/exceptions/app-http.exception';
import { ErrorCodeEnum } from 'src/common/enums/error-code.enum';
import { ConfigService } from '@nestjs/config';
import { PaymentInfo } from '../types/payment-info.type';
import { PaymentStatusEnum } from '../enums/payment-status.enum';
import { Request } from 'express';

export class StripeStrategy implements PaymentStrategy {
  constructor(
    @Inject('STRIPE_CLIENT') private readonly stripeClient: Stripe,
    private readonly configService: ConfigService,
  ) {}

  async createPaymentIntent(
    amount: number,
    currency: CurrenciesEnum,
    metadata: any,
  ) {
    const paymentIntent = await this.stripeClient.paymentIntents.create({
      currency,
      amount,
      metadata,
      payment_method_types: ['card'],
    });

    if (!paymentIntent.client_secret)
      throw new AppHttpException(ErrorCodeEnum.SERVER_SIDE_ERROR);

    return {
      id: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
    };
  }

  async handlePaymentWebhook(req: Request): Promise<PaymentInfo | void> {
    const endpointSecret = this.configService.get<string>(
      'STRIPE_WEBHOOK_SECRET',
    );
    if (!endpointSecret) {
      throw new AppHttpException(ErrorCodeEnum.NOT_IMPLEMENTED);
    }

    const sig = req.headers['stripe-signature'] as string;

    let event: Stripe.Event;

    try {
      event = this.stripeClient.webhooks.constructEvent(
        req.body,
        sig,
        endpointSecret,
      );
    } catch (err) {
      throw new AppHttpException(ErrorCodeEnum.FORBIDDEN);
    }

    let status: PaymentStatusEnum;
    let externalId: string;

    switch (event.type) {
      case 'payment_intent.created': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        status = PaymentStatusEnum.INCOMPLETE;
        externalId = paymentIntent.id;
        break;
      }
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        status = PaymentStatusEnum.SUCCEEDED;
        externalId = paymentIntent.id;
        break;
      }
      case 'payment_intent.processing': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        status = PaymentStatusEnum.INCOMPLETE;
        externalId = paymentIntent.id;
        break;
      }
      case 'payment_intent.canceled': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        status = PaymentStatusEnum.FAILED;
        externalId = paymentIntent.id;
        break;
      }
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        status = PaymentStatusEnum.FAILED;
        externalId = paymentIntent.id;
        break;
      }
      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        externalId = charge.payment_intent as string;
        status = PaymentStatusEnum.REFUNDED;
        break;
      }
      case 'charge.updated': {
        Logger.log(`Skipping charge.updated event: ${event.id}`);
        return;
      }
      default: {
        Logger.error(`Stripe Webhook: Unhandled event type: ${event.type}`);
        Logger.error(event.data.object);
        return;
      }
    }

    Logger.log(
      `Stripe Webhook: Processed event type: ${event.type}, Status: ${status}, ExternalId: ${externalId}`,
    );
    return {
      status,
      externalId,
    };
  }

  async refund(externalId: string, amount?: number): Promise<any> {
    return await this.stripeClient.refunds.create({
      payment_intent: externalId,
      ...(amount && { amount }),
    });
  }
}
