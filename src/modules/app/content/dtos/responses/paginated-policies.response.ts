import { paginatedObjectTypeFactory } from 'src/common/utilities/object-paginated-type.factory';
import { Policy } from '../../entities/policy.entity';

export const PaginatedPoliciesResponse = paginatedObjectTypeFactory(Policy);
