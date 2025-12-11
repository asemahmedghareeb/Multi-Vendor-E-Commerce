import { Injectable } from '@nestjs/common';
import { AppRepository } from 'src/modules/core/app-database/repositories/app.repository';
import { City } from '../entities/city.entity';
import { InjectAppRepository } from 'src/common/decorators/inject-app-repository.decorator';
import { CreateCityInput } from '../dtos/inputs/create-city.input';
import { AppHttpException } from 'src/common/exceptions/app-http.exception';
import { ErrorCodeEnum } from 'src/common/enums/error-code.enum';
import { Country } from '../entities/country.entity';
import { UpdateCityInput } from '../dtos/inputs/update-city.input';
import { PaginatorInput } from 'src/common/dtos/inputs/paginator.input';

@Injectable()
export class CityService {
  constructor(
    @InjectAppRepository(City)
    private readonly cityRepository: AppRepository<City>,
    @InjectAppRepository(Country)
    private readonly countryRepository: AppRepository<Country>,
  ) {}

  async getCities(paginator?: PaginatorInput) {
    return this.cityRepository.findPaginated(
      undefined,
      undefined,
      paginator?.page,
      paginator?.limit,
    );
  }

  async getCity(id: string) {
    const city = await this.cityRepository.findOne({
      where: {
        id,
      },
    });

    if (!city) throw new AppHttpException(ErrorCodeEnum.CITY_DOES_NOT_EXIST);

    return city;
  }

  async createCity(input: CreateCityInput) {
    const country = await this.countryRepository.findOne({
      where: {
        id: input.countryId,
      },
    });

    if (!country) {
      throw new AppHttpException(ErrorCodeEnum.BAD_REQUEST_EXCEPTION, {
        message: 'Country not found',
      });
    }

    if (
      await this.cityRepository.exists({
        where: [
          {
            arName: input.arName,
          },
          {
            enName: input.enName,
          },
        ],
      })
    ) {
      throw new AppHttpException(ErrorCodeEnum.BAD_REQUEST_EXCEPTION, {
        message: 'City name should be unique!',
      });
    }

    await this.cityRepository.createOne(input);

    return true;
  }

  async updateCity(input: UpdateCityInput) {
    const city = await this.cityRepository.findOne({
      where: {
        id: input.id,
      },
    });

    if (!city) {
      throw new AppHttpException(ErrorCodeEnum.CITY_DOES_NOT_EXIST);
    }

    await this.cityRepository.updateOneFromExistingModel(city, input);

    return true;
  }

  async deleteCity(cityId: string) {
    const city = await this.cityRepository.findOne({
      where: {
        id: cityId,
      },
    });

    if (!city) {
      throw new AppHttpException(ErrorCodeEnum.CITY_DOES_NOT_EXIST);
    }

    await this.cityRepository.remove(city);

    return true;
  }
}
