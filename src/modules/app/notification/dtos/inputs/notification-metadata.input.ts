import { Field, InputType } from '@nestjs/graphql';
import { NotificationTargetEnum } from '../../enums/notification-target.enum';
import { NotificationTypeEnum } from '../../enums/notification-type.enum';

@InputType()
export class NotificationMetadataInput {
  @Field(() => NotificationTypeEnum)
  notificationType: NotificationTypeEnum;

  @Field(() => NotificationTargetEnum)
  notificationTarget: NotificationTargetEnum;
  //   todo add other metadata
}
