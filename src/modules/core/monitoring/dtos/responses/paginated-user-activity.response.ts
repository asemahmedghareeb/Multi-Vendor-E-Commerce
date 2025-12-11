import { paginatedObjectTypeFactory } from 'src/common/utilities/object-paginated-type.factory';
import { UserActivity } from '../../entities/user-activity.entity';

export const PaginatedUserActivityResponse =
  paginatedObjectTypeFactory(UserActivity);
