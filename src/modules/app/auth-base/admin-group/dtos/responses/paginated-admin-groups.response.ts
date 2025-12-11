import { paginatedObjectTypeFactory } from 'src/common/utilities/object-paginated-type.factory';
import { AdminGroup } from '../../entities/admin-group.entity';

export const PaginatedAdminGroupsResponse =
  paginatedObjectTypeFactory(AdminGroup);
