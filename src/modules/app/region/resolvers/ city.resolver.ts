import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { City } from '../entities/city.entity';
import { CityService } from '../services/city.service';
import { Auth } from 'src/common/decorators/auth.decorator';
import { UserRoleEnum } from 'src/common/enums/user-role.enum';
import { DefaultPermissionActionsEnum } from 'src/common/enums/default-permissions.enum';
import { Permission } from '../../auth-base/admin-group/entities/permission.entity';
import { Transactional } from 'typeorm-transactional';
import { CreateCityInput } from '../dtos/inputs/create-city.input';
import { UpdateCityInput } from '../dtos/inputs/update-city.input';
import { SoftDeleteCityInput } from '../dtos/inputs/soft-delete-city.input';
import { PaginatedCitiesResponse } from '../dtos/responses/paginated-cities.response';
import { NullablePaginatorArgsInput } from 'src/common/dtos/inputs/paginator.input';
import { GetCityInput } from '../dtos/inputs/get-city.input';
import { Country } from '../entities/country.entity';
import { CountryDataloader } from '../dataloaders/country.dataloader';

@Resolver(() => City)
export class CityResolver {
  constructor(
    private readonly cityService: CityService,
    private readonly countryDataloader: CountryDataloader,
  ) {}

  @Query(() => City)
  @Auth({
    roles: [UserRoleEnum.ADMIN],
    permissions: [
      {
        action: DefaultPermissionActionsEnum.READ,
        target: City.permissionsTarget,
      },
    ],
  })
  @Transactional()
  adminGetCity(@Args() input: GetCityInput) {
    return this.cityService.getCity(input.id);
  }

  @Query(() => PaginatedCitiesResponse)
  @Auth({
    roles: [UserRoleEnum.ADMIN],
    permissions: [
      {
        action: DefaultPermissionActionsEnum.READ,
        target: City.permissionsTarget,
      },
    ],
  })
  @Transactional()
  adminGetCities(@Args() input: NullablePaginatorArgsInput) {
    return this.cityService.getCities(input.paginate);
  }

  @Mutation(() => Boolean)
  @Auth({
    roles: [UserRoleEnum.ADMIN],
    permissions: [
      {
        action: DefaultPermissionActionsEnum.CREATE,
        target: Permission.permissionsTarget,
      },
    ],
  })
  @Transactional()
  adminCreateCity(@Args('input') input: CreateCityInput) {
    return this.cityService.createCity(input);
  }

  @Mutation(() => Boolean)
  @Auth({
    roles: [UserRoleEnum.ADMIN],
    permissions: [
      {
        action: DefaultPermissionActionsEnum.UPDATE,
        target: Permission.permissionsTarget,
      },
    ],
  })
  @Transactional()
  adminUpdateCity(@Args('input') input: UpdateCityInput) {
    return this.cityService.updateCity(input);
  }

  @Mutation(() => Boolean)
  @Auth({
    roles: [UserRoleEnum.ADMIN],
    permissions: [
      {
        action: DefaultPermissionActionsEnum.DELETE,
        target: City.permissionsTarget,
      },
    ],
  })
  @Transactional()
  adminDeleteCity(@Args() input: SoftDeleteCityInput) {
    return this.cityService.deleteCity(input.id);
  }

  @ResolveField(() => Country)
  country(@Parent() city: City) {
    if (city.country) return city.country;
    const loader = this.countryDataloader.getDataloader();
    return loader.load(city.countryId);
  }
}
