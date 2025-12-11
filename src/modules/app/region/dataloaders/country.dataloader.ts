import { AppRequestScopedDataloader } from 'src/common/decorators/app-request-scoped-dataloader.decorator';
import { AppDataloader } from 'src/common/interfaces/dataloader.interface';
import { Country } from '../entities/country.entity';
import { In, Repository } from 'typeorm';
import * as Dataloader from 'dataloader';
import { InjectAppRepository } from 'src/common/decorators/inject-app-repository.decorator';

@AppRequestScopedDataloader()
export class CountryDataloader implements AppDataloader<string, Country> {
  loader: Dataloader<string, Country>;

  constructor(
    @InjectAppRepository(Country)
    private readonly countryRepository: Repository<Country>,
  ) {
    this.loader = new Dataloader((countryIds: string[]) =>
      this.getCountriesByIds(countryIds),
    );
  }

  private async getCountriesByIds(countryIds: string[]) {
    const countries = await this.countryRepository.find({
      where: {
        id: In(countryIds),
      },
    });

    const countryMap = {};

    countries.forEach((country) => (countryMap[country.id] = country));

    return countryIds.map((id) => countryMap[id]);
  }

  getDataloader(): Dataloader<string, Country> {
    return this.loader;
  }
}
