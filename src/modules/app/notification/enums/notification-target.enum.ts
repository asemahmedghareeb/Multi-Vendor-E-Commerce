import { registerEnumType } from '@nestjs/graphql';

export enum NotificationTargetEnum {
  TARGET1 = 'TARGET1',
  TARGET2 = 'TARGET2',
  TARGET3 = 'TARGET3',
  VENDOR_REQUEST = 'VENDOR_REQUEST',
  ORDER_STATUS = 'ORDER_STATUS',
}

registerEnumType(NotificationTargetEnum, {
  name: 'NotificationTargetEnum',
});
