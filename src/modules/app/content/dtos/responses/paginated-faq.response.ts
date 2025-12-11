import { paginatedObjectTypeFactory } from 'src/common/utilities/object-paginated-type.factory';
import { FAQ } from '../../entities/faq.entity';

export const PaginatedFAQResponse = paginatedObjectTypeFactory(FAQ);
