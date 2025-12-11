import { Injectable } from '@nestjs/common';
import { StaticCountry } from '../dtos/responses/static-country.response';
import { LangEnum } from 'src/common/enums/lang.enum';
import { COUNTRIES } from 'src/consts/region/countries.const';

@Injectable()
export class StaticCountryService {
  getStaticCountries(lang: LangEnum) {
    const localizedCountries: StaticCountry[] = [];

    Object.entries(COUNTRIES).forEach(([key, value]) => {
      localizedCountries.push({
        code: key,
        name: lang == LangEnum.AR ? value.AR : value.EN,
      });
    });

    return localizedCountries;
  }
}
