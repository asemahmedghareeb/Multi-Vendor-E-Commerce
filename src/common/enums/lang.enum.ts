import { registerEnumType } from '@nestjs/graphql';

export enum LangEnum {
  EN = 'en',
  AR = 'ar',
}
registerEnumType(LangEnum, { name: 'LangEnum' });
