import { AppRequestScopedDataloader } from 'src/common/decorators/app-request-scoped-dataloader.decorator';
import { AppDataloader } from 'src/common/interfaces/dataloader.interface';
import * as Dataloader from 'dataloader';
import { AppRepository } from 'src/modules/core/app-database/repositories/app.repository';
import { InjectAppRepository } from 'src/common/decorators/inject-app-repository.decorator';
import { In } from 'typeorm';
import { Order } from '../entities/order.entity';

@AppRequestScopedDataloader()
export class OrderDataloader implements AppDataloader<string, Order> {
  loader: Dataloader<string, Order>;

  constructor(
    @InjectAppRepository(Order)
    private readonly orderRepository: AppRepository<Order>,
  ) {
    this.loader = new Dataloader((orderIds: string[]) =>
      this.getOrdersByIds(orderIds),
    );
  }

  private async getOrdersByIds(orderIds: string[]) {
    const orders = await this.orderRepository.find({
      where: { id: In(orderIds) },
    });

    const orderMap = {};

    orders.forEach((order) => (orderMap[order.id] = order));

    return orderIds.map((id) => orderMap[id]);
  }

  getDataloader(): Dataloader<string, Order> {
    return this.loader;
  }
}
