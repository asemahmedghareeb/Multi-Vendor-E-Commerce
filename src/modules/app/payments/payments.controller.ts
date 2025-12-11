import {
  Controller,
  Post,
  Req,
  Headers,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentsService } from './payments.service';
import Stripe from 'stripe';
import express from 'express';

@Controller('payments')
export class PaymentsController {
  private stripe: Stripe;

  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly configService: ConfigService,
  ) {
    const apiKey = this.configService.get<string>('STRIPE_SECRET_KEY');

    if (!apiKey) {
      throw new Error('STRIPE_SECRET_KEY is not defined in .env file');
    }
    this.stripe = new Stripe(apiKey, {
      apiVersion: '2025-11-17.clover',
    });
  }

  @Post('webhook')
  async handleWebhook(
    @Req() req: express.Request,
    @Headers('stripe-signature') signature: string,
  ) {
    console.log('Webhook Endpoint Hit!');

    if (!signature) throw new BadRequestException('Missing Stripe Signature');

    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        req.body,
        signature,
        this.configService.get('STRIPE_WEBHOOK_SECRET') as string,
      );
    } catch (err) {
      console.error(`Webhook Error: ${err.message}`);
      throw new BadRequestException(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.log('Payment Succeeded:', paymentIntent.id);

      await this.paymentsService.handlePaymentSuccess(paymentIntent);
    }

    if (event.type == 'charge.refunded') {
      const charge = event.data.object as Stripe.Charge;
      console.log(charge.payment_intent);
      await this.paymentsService.handleRefundWebhook(charge);
    }
    if (event.type === 'payment_intent.payment_failed') {
      const failedIntent = event.data.object as Stripe.PaymentIntent;
      console.log('Payment Failed:', failedIntent.id);
      await this.paymentsService.handlePaymentFailure(failedIntent);
    }
    return { received: true };
  }
}
