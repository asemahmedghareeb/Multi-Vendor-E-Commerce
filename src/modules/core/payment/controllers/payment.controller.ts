import { Body, Controller, Param, Post, Req } from '@nestjs/common';
import { PaymentGatewaysEnum } from '../enums/payment-gateways.enum';
import { AppHttpException } from 'src/common/exceptions/app-http.exception';
import { ErrorCodeEnum } from 'src/common/enums/error-code.enum';
import { PaymentService } from '../services/payment.service';
import { Request } from 'express';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('webhook/:paymentGateway')
  paymentWebhook(
    @Param('paymentGateway') paymentGateway: PaymentGatewaysEnum,
    @Req() req: Request,
  ) {
    if (!Object.values(PaymentGatewaysEnum).includes(paymentGateway)) {
      throw new AppHttpException(ErrorCodeEnum.NOT_FOUND);
    }

    return this.paymentService.handlePaymentWebhook(paymentGateway, req);
  }
}
