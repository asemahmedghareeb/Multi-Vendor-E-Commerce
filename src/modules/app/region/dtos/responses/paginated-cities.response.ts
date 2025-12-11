import { paginatedObjectTypeFactory } from 'src/common/utilities/object-paginated-type.factory';
import { City } from '../../entities/city.entity';

export const PaginatedCitiesResponse = paginatedObjectTypeFactory(City);
