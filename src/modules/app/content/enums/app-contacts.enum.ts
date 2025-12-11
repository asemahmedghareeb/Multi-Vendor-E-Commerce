import { registerEnumType } from '@nestjs/graphql';

export enum AppContactsEnum {
  FACEBOOK = 'FACEBOOK',
  X = 'X',
  LINKEDIN = 'LINKEDIN',
  INSTAGRAM = 'INSTAGRAM',
  WHATSAPP = 'WHATSAPP',
  PHONE_NUMBER = 'PHONE_NUMBER',
  EMAIL = 'EMAIL',
}

registerEnumType(AppContactsEnum, {
  name: 'AppContactsEnum',
});
