import { ObjectType } from '@nestjs/graphql';
import { paginatedObjectTypeFactory } from 'src/common/utilities/object-paginated-type.factory';
import { CartItem } from '../../entities/cart-item.entity';

@ObjectType()
export class CartItemPaginated extends paginatedObjectTypeFactory(CartItem) {}
