import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { NotificationEnum } from '../enums/notification.enum';
import { LangEnum } from 'src/common/enums/lang.enum';
import { AppHelperService } from '../../app-helper/services/app-helper.service';
import { AppConfig } from 'src/config/app.config';
import { AppHttpException } from 'src/common/exceptions/app-http.exception';
import { ErrorCodeEnum } from 'src/common/enums/error-code.enum';

@Injectable()
export class NotificationPusherService {
  constructor(
    @InjectQueue('notification-pusher-queue')
    private readonly notificationsQueue: Queue,
    private readonly appHelperService: AppHelperService,
  ) {}

  sendNotification(token: string, title: string, body: string, data: {} = {}) {
    if (!AppConfig.allowNotificationPusher) {
      throw new AppHttpException(ErrorCodeEnum.NOT_IMPLEMENTED, {
        message: 'The notification pusher in not implemented in this app!',
      });
    }

    this.notificationsQueue.add('send-notification', {
      token,
      title,
      body,
      data,
    });
  }

  sendLocalizedNotification(
    token: string,
    notification: NotificationEnum,
    context: {},
    lang: LangEnum,
    data?: {},
  ) {
    const title = this.appHelperService.localize(
      `notifications.${notification}.title`,
      context,
      lang,
    );

    const body = this.appHelperService.localize(
      `notifications.${notification}.body`,
      context,
      lang,
    );

    this.sendNotification(token, title, body, data);
  }
}
