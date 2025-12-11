import { paginatedObjectTypeFactory } from 'src/common/utilities/object-paginated-type.factory';
import { Permission } from '../../entities/permission.entity';

export const PaginatedPermissionsResponse =
  paginatedObjectTypeFactory(Permission);
