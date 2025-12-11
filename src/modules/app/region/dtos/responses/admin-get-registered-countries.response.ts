import { paginatedObjectTypeFactory } from 'src/common/utilities/object-paginated-type.factory';
import { Country } from '../../entities/country.entity';

export const AdminGetRegisteredCountriesResponse =
  paginatedObjectTypeFactory(Country);
