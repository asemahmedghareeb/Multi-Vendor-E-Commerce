import { registerEnumType } from '@nestjs/graphql';

export enum NotificationTypeEnum {
  TYPE1 = 'TYPE1',
  TYPE2 = 'TYPE2',
  TYPE3 = 'TYPE3',
}

registerEnumType(NotificationTypeEnum, {
  name: 'NotificationTypeEnum',
});
