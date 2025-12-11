import { Injectable } from '@nestjs/common';
import { InjectAppRepository } from 'src/common/decorators/inject-app-repository.decorator';
import { Country } from '../entities/country.entity';
import { AppRepository } from 'src/modules/core/app-database/repositories/app.repository';
import { AppHttpException } from 'src/common/exceptions/app-http.exception';
import { ErrorCodeEnum } from 'src/common/enums/error-code.enum';
import { COUNTRIES } from 'src/consts/region/countries.const';
import { PaginatorInput } from 'src/common/dtos/inputs/paginator.input';

@Injectable()
export class CountryService {
  constructor(
    @InjectAppRepository(Country)
    private readonly countryRepository: AppRepository<Country>,
  ) {}

  async getRegisteredCountries(paginatorInput?: PaginatorInput) {
    return this.countryRepository.findPaginated(
      undefined,
      undefined,
      paginatorInput?.page,
      paginatorInput?.limit,
    );
  }

  async registerOperatingCountry(countryCode: string) {
    if (
      await this.countryRepository.exists({
        where: {
          countryCode,
        },
      })
    ) {
      throw new AppHttpException(ErrorCodeEnum.COUNTRY_ALREADY_EXIST);
    }
    const country = COUNTRIES[countryCode];

    if (!country)
      throw new AppHttpException(ErrorCodeEnum.INVALID_COUNTRY_CODE);

    await this.countryRepository.createOne({
      countryCode,
      enName: country.EN,
      arName: country.AR,
    });

    return true;
  }

  async unregisterOperatingCountry(id: string) {
    const country = await this.countryRepository.findOne({
      where: {
        id,
      },
    });

    if (!country)
      throw new AppHttpException(ErrorCodeEnum.COUNTY_DOES_NOT_EXIST);

    await this.countryRepository.remove(country);

    return true;
  }
}
