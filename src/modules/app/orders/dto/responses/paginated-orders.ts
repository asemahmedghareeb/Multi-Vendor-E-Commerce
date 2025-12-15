import { ObjectType } from '@nestjs/graphql';
import { paginatedObjectTypeFactory } from 'src/common/utilities/object-paginated-type.factory';
import { Order } from '../../entities/order.entity';


@ObjectType()
export class OrdersPaginated extends paginatedObjectTypeFactory(Order) {}
