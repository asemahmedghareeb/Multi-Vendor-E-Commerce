import { paginatedObjectTypeFactory } from 'src/common/utilities/object-paginated-type.factory';
import { AppContact } from '../../entities/app-contact.entity';

export const PaginatedAppContactsResponse =
  paginatedObjectTypeFactory(AppContact);
