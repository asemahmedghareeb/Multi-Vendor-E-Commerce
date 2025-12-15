import { ObjectType } from '@nestjs/graphql';
import { paginatedObjectTypeFactory } from 'src/common/utilities/object-paginated-type.factory';
import { Order } from 'src/modules/app/orders/entities/order.entity';

@ObjectType()
export class PaginatedVendorOrders extends paginatedObjectTypeFactory(Order) {}
