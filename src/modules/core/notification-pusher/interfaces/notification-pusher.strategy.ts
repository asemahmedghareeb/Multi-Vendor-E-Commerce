import { NotificationPayloadType } from '../types/notification-payload.type';

export interface NotificationPusherStrategy {
  sendNotification(payload: NotificationPayloadType): Promise<any>;
}
