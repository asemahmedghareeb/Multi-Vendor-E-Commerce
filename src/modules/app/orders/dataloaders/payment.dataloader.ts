import { AppRequestScopedDataloader } from 'src/common/decorators/app-request-scoped-dataloader.decorator';
import { AppDataloader } from 'src/common/interfaces/dataloader.interface';
import { In } from 'typeorm';
import * as Dataloader from 'dataloader';
import { InjectAppRepository } from 'src/common/decorators/inject-app-repository.decorator';
import { AppRepository } from 'src/modules/core/app-database/repositories/app.repository';
import { Payment } from 'src/modules/app/payment/entities/payment.entity';

@AppRequestScopedDataloader()
export class PaymentDataloader implements AppDataloader<string, Payment> {
  loader: Dataloader<string, Payment>;

  constructor(
    @InjectAppRepository(Payment)
    private readonly paymentRepository: AppRepository<Payment>,
  ) {
    this.loader = new Dataloader((orderIds: string[]) =>
      this.getPaymentsByOrderIds(orderIds),
    );
  }

  private async getPaymentsByOrderIds(orderIds: string[]) {
    const payments = await this.paymentRepository.find({
      where: { orderId: In(orderIds) },
    });

    const paymentMap = {};

    payments.forEach((payment) => {
      if (payment.orderId) {
        paymentMap[payment.orderId] = payment;
      }
    });

    return orderIds.map((id) => paymentMap[id]);
  }

  getDataloader(): Dataloader<string, Payment> {
    return this.loader;
  }
}
