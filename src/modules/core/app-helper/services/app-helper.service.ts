import { Injectable } from '@nestjs/common';
import { CodePrefixEnum } from '../enums/code-prefix.enum';
import { AppRepository } from '../../app-database/repositories/app.repository';
import { AppHttpException } from 'src/common/exceptions/app-http.exception';
import { ErrorCodeEnum } from 'src/common/enums/error-code.enum';
import { AppBaseEntity } from '../../app-database/entities/app-base.entity';
import { FindOptionsWhere } from 'typeorm';
import { LangEnum } from 'src/common/enums/lang.enum';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class AppHelperService {
  constructor(private readonly i18nService: I18nService) {}

  public generateRandomString(length: number, characterSet: string) {
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characterSet.charAt(
        Math.floor(Math.random() * characterSet.length),
      );
    }
    return result;
  }

  generateRandomNumber(length: number) {
    const characters = '0123456789';
    return this.generateRandomString(length, characters);
  }

  async generateEntityCodeWithPrefix<
    T extends AppBaseEntity & { code: string },
  >(prefix: CodePrefixEnum, repo: AppRepository<T>): Promise<string> {
    let counter = 0,
      doesCodeExist: T | null,
      code: string;
    do {
      counter += 1;
      if (counter >= 10)
        throw new AppHttpException(ErrorCodeEnum.SERVER_SIDE_ERROR);
      code = `${prefix}-${this.generateRandomNumber(8)}`;
      try {
        doesCodeExist = await repo.findOne({
          where: {
            code,
          } as FindOptionsWhere<T>,
        });
      } catch (err) {
        throw new AppHttpException(ErrorCodeEnum.SERVER_SIDE_ERROR);
      }
    } while (doesCodeExist);
    return code;
  }

  serializeArabic(text: string): string {
    const rli = '\u2067';
    const pdi = '\u2069';
    return `${rli}${text}${pdi}`;
  }

  localize(key: string, context: {}, lang?: LangEnum) {
    const x = {
      args: context,
    };
    if (lang) {
      // @ts-ignore
      x.lang = lang;
    }
    
    const localized = this.i18nService.t(key, x) as string;

    if (lang == LangEnum.AR) return this.serializeArabic(localized);
    return localized;
  }
}
