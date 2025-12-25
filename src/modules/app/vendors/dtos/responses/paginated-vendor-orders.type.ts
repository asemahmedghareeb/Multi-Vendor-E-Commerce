import { ObjectType } from '@nestjs/graphql';
import { paginatedObjectTypeFactory } from 'src/common/utilities/object-paginated-type.factory';
import { OrderItem } from 'src/modules/app/orders/entities/order-item.entity';

@ObjectType()
export class PaginatedVendorOrders extends paginatedObjectTypeFactory(
  OrderItem,
) {}
