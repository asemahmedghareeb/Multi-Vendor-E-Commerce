import { ObjectType } from '@nestjs/graphql';
import { paginatedObjectTypeFactory } from 'src/common/utilities/object-paginated-type.factory';
import { Review } from '../../entities/review.entity';

@ObjectType()
export class PaginatedReviews extends paginatedObjectTypeFactory(Review) {}
