import { ObjectType } from '@nestjs/graphql';
import { paginatedObjectTypeFactory } from 'src/common/utilities/object-paginated-type.factory';
import { CartItem } from 'src/modules/app/cart/entities/cart-item.entity';


@ObjectType()
export class PaginatedWishlist extends paginatedObjectTypeFactory(CartItem) {}
