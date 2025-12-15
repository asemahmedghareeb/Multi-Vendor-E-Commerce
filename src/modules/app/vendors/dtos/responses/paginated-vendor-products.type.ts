import { ObjectType } from '@nestjs/graphql';
import { paginatedObjectTypeFactory } from 'src/common/utilities/object-paginated-type.factory';
import { Product } from 'src/modules/app/product/entities/product.entity';

@ObjectType()
export class PaginatedVendorProducts extends paginatedObjectTypeFactory(Product) {}
