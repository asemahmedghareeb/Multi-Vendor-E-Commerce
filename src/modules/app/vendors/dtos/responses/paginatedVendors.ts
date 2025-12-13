import { paginatedObjectTypeFactory } from 'src/common/utilities/object-paginated-type.factory';
import { Vendor } from '../../entities/vendor.entity';
import { ObjectType } from '@nestjs/graphql';

@ObjectType()
export class PaginatedVendors extends paginatedObjectTypeFactory(Vendor) {}
