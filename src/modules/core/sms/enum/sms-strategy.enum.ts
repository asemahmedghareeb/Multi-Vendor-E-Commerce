import { registerEnumType } from '@nestjs/graphql';

export enum SmsStrategyEnum {
  WHATSAPP = 'WHATSAPP',
  SMS = 'SMS',
}

registerEnumType(SmsStrategyEnum, {
  name: 'SmsStrategyEnum',
});
