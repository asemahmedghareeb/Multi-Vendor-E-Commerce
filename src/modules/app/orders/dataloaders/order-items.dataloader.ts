import { AppRequestScopedDataloader } from 'src/common/decorators/app-request-scoped-dataloader.decorator';
import { AppDataloader } from 'src/common/interfaces/dataloader.interface';
import { In } from 'typeorm';
import * as Dataloader from 'dataloader';
import { OrderItem } from '../entities/order-item.entity';
import { InjectAppRepository } from 'src/common/decorators/inject-app-repository.decorator';
import { AppRepository } from 'src/modules/core/app-database/repositories/app.repository';

@AppRequestScopedDataloader()
export class OrderItemsLoader implements AppDataloader<string, OrderItem[]> {
  loader: Dataloader<string, OrderItem[]>;

  constructor(
    @InjectAppRepository(OrderItem)
    private readonly orderItemRepository: AppRepository<OrderItem>,
  ) {
    this.loader = new Dataloader((orderIds: string[]) =>
      this.getItemsByOrderIds(orderIds),
    );
  }

  private async getItemsByOrderIds(orderIds: string[]) {
    const items = await this.orderItemRepository.find({
      where: { orderId: In(orderIds) },
      order: { createdAt: 'ASC' },
    });

    const groupedByOrderId = {};

    items.forEach((item: OrderItem) => {
      if (!groupedByOrderId[item.orderId]) {
        groupedByOrderId[item.orderId] = [];
      }
      groupedByOrderId[item.orderId].push(item);
    });

    return orderIds.map((id) => groupedByOrderId[id] || []);
  }

  getDataloader(): Dataloader<string, OrderItem[]> {
    return this.loader;
  }
}
