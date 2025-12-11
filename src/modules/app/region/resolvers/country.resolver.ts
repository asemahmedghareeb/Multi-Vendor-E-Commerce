import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Country } from '../entities/country.entity';
import { CountryService } from '../services/country.service';
import { RegisterOperatingCountryInput } from '../dtos/inputs/register-operating-country.input';
import { Auth } from 'src/common/decorators/auth.decorator';
import { UserRoleEnum } from 'src/common/enums/user-role.enum';
import { CountryPermissionEnum } from '../enums/country-permission.enum';
import { UnregisterOperatingCountry } from '../dtos/inputs/unregister-operating-country.input';
import { AdminGetRegisteredCountriesResponse } from '../dtos/responses/admin-get-registered-countries.response';
import { NullablePaginatorArgsInput } from 'src/common/dtos/inputs/paginator.input';

@Resolver(() => Country)
export class CountryResolver {
  constructor(private readonly countryService: CountryService) {}
  @Query(() => AdminGetRegisteredCountriesResponse)
  @Auth({
    roles: [UserRoleEnum.ADMIN],
    permissions: [
      {
        target: Country.permissionsTarget,
        action: CountryPermissionEnum.READ,
      },
    ],
  })
  adminGetRegisteredCountries(@Args() input: NullablePaginatorArgsInput) {
    return this.countryService.getRegisteredCountries(input.paginate);
  }

  @Mutation(() => Boolean)
  @Auth({
    roles: [UserRoleEnum.ADMIN],
    permissions: [
      {
        target: Country.permissionsTarget,
        action: CountryPermissionEnum.REGISTER,
      },
    ],
  })
  adminRegisterCountry(@Args() input: RegisterOperatingCountryInput) {
    return this.countryService.registerOperatingCountry(input.countryCode);
  }

  @Mutation(() => Boolean)
  @Auth({
    roles: [UserRoleEnum.ADMIN],
    permissions: [
      {
        target: Country.permissionsTarget,
        action: CountryPermissionEnum.UNREGISTER,
      },
    ],
  })
  adminUnregisterCountry(@Args() input: UnregisterOperatingCountry) {
    return this.countryService.unregisterOperatingCountry(input.id);
  }
}
