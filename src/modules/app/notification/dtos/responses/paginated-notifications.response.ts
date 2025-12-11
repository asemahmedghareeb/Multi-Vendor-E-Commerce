import { paginatedObjectTypeFactory } from 'src/common/utilities/object-paginated-type.factory';
import { Notification } from '../../entities/notification.entity';

export const PaginatedNotificationsResponse =
  paginatedObjectTypeFactory(Notification);
