import { ObjectType } from '@nestjs/graphql';

import { paginatedObjectTypeFactory } from 'src/common/utilities/object-paginated-type.factory';
import { Category } from '../../entities/category.entity';


@ObjectType()
export class PaginatedCategories extends paginatedObjectTypeFactory(Category) {}
