import { ObjectType } from '@nestjs/graphql';
import { Product } from '../../entities/product.entity';
import { paginatedObjectTypeFactory } from 'src/common/utilities/object-paginated-type.factory';
import { cursorPaginatedObjectTypeFactory } from 'src/common/utilities/object-cursor-paginated-type.factory';


@ObjectType()
export class ProductPaginated extends paginatedObjectTypeFactory(Product) {}

@ObjectType()
export class ProductCursorPaginated extends cursorPaginatedObjectTypeFactory(Product) {}
