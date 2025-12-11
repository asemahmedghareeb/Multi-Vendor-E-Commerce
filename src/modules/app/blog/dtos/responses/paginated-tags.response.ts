import { paginatedObjectTypeFactory } from 'src/common/utilities/object-paginated-type.factory';
import { Tag } from '../../entities/tag.entity';

export const PaginatedTagsResponse = paginatedObjectTypeFactory(Tag);

