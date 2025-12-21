import { get } from 'env-var';
import { CurrenciesEnum } from 'src/common/enums/currency.enum';
import { LangEnum } from 'src/common/enums/lang.enum';
import { AppConfigType } from 'src/common/types/app-config.type';

export const AppConfig: AppConfigType = {
  AppName: get('APP_NAME').required().asString(),
  AppEmail: get('APP_EMAIL').required().asString(),
  nodeEnv: get('NODE_ENV').required().asString(),
  defaultLang: LangEnum.EN,
  phoneNumberAuth: true,
  allowMail: true,
  allowSms: true,
  allowNotificationPusher: true,
  appGeneralCurrency: CurrenciesEnum.USD,
  monitorUserActivity: false,
  MAX_CART_ITEMS: 50,
  throttlers: [
    {
      ttl: 60000,
      limit: 100,
    },
  ],
  
};
