import { ObjectType } from '@nestjs/graphql';
import { paginatedObjectTypeFactory } from 'src/common/utilities/object-paginated-type.factory';
import { Follow } from '../entities/follow.entity';


@ObjectType()
export class FollowersPaginated extends paginatedObjectTypeFactory(Follow) {}
