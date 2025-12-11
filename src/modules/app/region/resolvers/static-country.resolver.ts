import { Context, Query, Resolver } from '@nestjs/graphql';
import { StaticCountry } from '../dtos/responses/static-country.response';
import { StaticCountryService } from '../services/static-country.service';
import { AppGqlContext } from 'src/common/types/gql-context.type';

@Resolver(() => StaticCountry)
export class StaticCountryResolver {
  constructor(private readonly staticCountryService: StaticCountryService) {}

  @Query(() => [StaticCountry])
  getStaticCountries(@Context() context: AppGqlContext) {
    return this.staticCountryService.getStaticCountries(context.lang);
  }
}
