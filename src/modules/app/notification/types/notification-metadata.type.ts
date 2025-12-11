import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { NotificationTargetEnum } from '../enums/notification-target.enum';
import { NotificationTypeEnum } from '../enums/notification-type.enum';

@ObjectType()
export class NotificationMetadataType {
  @Field(() => NotificationTypeEnum)
  notificationType: NotificationTypeEnum;

  @Field(() => NotificationTargetEnum)
  notificationTarget: NotificationTargetEnum;
  //   todo add other metadata
}


