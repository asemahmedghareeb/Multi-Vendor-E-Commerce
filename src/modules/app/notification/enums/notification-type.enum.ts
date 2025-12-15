import { registerEnumType } from '@nestjs/graphql';

export enum NotificationTypeEnum {
  TYPE1 = 'TYPE1',
  TYPE2 = 'TYPE2',
  TYPE3 = 'TYPE3',
  VENDOR_ACCOUNT_APPROVED = 'VENDOR_ACCOUNT_APPROVED',
  VENDOR_ACCOUNT_REJECTED = 'VENDOR_ACCOUNT_REJECTED',
  ORDER_STATUS_UPDATED = 'ORDER_STATUS_UPDATED',
}

registerEnumType(NotificationTypeEnum, {
  name: 'NotificationTypeEnum',
});
