import { registerEnumType } from '@nestjs/graphql';

export enum NotificationTargetEnum {
  TARGET1 = 'TARGET1',
  TARGET2 = 'TARGET2',
  TARGET3 = 'TARGET3',
}

registerEnumType(NotificationTargetEnum, {
  name: 'NotificationTargetEnum',
});
