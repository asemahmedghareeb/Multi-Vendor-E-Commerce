import { ObjectType } from '@nestjs/graphql';
import { paginatedObjectTypeFactory } from 'src/common/utilities/object-paginated-type.factory';
import { Review } from 'src/modules/app/reviews/entities/review.entity';

@ObjectType()
export class PaginatedVendorReviews extends paginatedObjectTypeFactory(Review) {}
