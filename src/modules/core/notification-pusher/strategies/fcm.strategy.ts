import { Injectable } from '@nestjs/common';
import * as fireBaseAdmin from 'firebase-admin';
import { NotificationPusherStrategy } from '../interfaces/notification-pusher.strategy';
import { NotificationPayloadType } from '../types/notification-payload.type';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FcmStrategy implements NotificationPusherStrategy {
  constructor(private readonly configService: ConfigService) {
    if (!fireBaseAdmin.apps.length) {
      fireBaseAdmin.initializeApp({
        credential: fireBaseAdmin.credential.cert({
          projectId: this.configService.get<string>('FIREBASE_PROJECT_ID'),
          clientEmail: this.configService.get<string>('FIREBASE_CLIENT_EMAIL'),
          privateKey: this.configService.get<string>('FIREBASE_PRIVATE_KEY'),
        }),
      });
    }
  }

  async sendNotification(payload: NotificationPayloadType): Promise<any> {
    const message: fireBaseAdmin.messaging.Message = {
      token: payload.token,
      notification: { title: payload.title, body: payload.body },
      data: payload.data,
    };

    await fireBaseAdmin.messaging().send(message);
  }
}
