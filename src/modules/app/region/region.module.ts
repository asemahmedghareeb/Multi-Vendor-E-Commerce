import { Module } from '@nestjs/common';
import { StaticCountryService } from './services/static-country.service';
import { StaticCountryResolver } from './resolvers/static-country.resolver';
import { CountryService } from './services/country.service';
import { CountryResolver } from './resolvers/country.resolver';
import { AppDatabaseModule } from 'src/modules/core/app-database/app-database.module';
import { Country } from './entities/country.entity';
import { CityService } from './services/city.service';
import { CityResolver } from './resolvers/ city.resolver';
import { City } from './entities/city.entity';
import { CountryDataloader } from './dataloaders/country.dataloader';

@Module({
  imports: [AppDatabaseModule.forFeature([Country, City])],
  providers: [
    StaticCountryService,
    StaticCountryResolver,
    CountryService,
    CountryResolver,
    CityService,
    CityResolver,
    CountryDataloader,
  ],
  exports: [],
})
export class RegionModule {}
