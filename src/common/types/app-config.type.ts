import { ThrottlerOptions } from '@nestjs/throttler';
import { LangEnum } from '../enums/lang.enum';
import { CurrenciesEnum } from '../enums/currency.enum';

export type AppConfigType = {
  AppName: string;
  AppEmail: string;
  defaultLang: LangEnum;
  nodeEnv: string;
  phoneNumberAuth: boolean;
  allowSms: boolean;
  allowMail: boolean;
  allowNotificationPusher: boolean;
  appGeneralCurrency: CurrenciesEnum;
  monitorUserActivity: boolean;
  MAX_CART_ITEMS: number;
  throttlers: ThrottlerOptions[];
};
