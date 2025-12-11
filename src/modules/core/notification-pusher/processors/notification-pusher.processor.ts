import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject, Logger } from '@nestjs/common';
import { FcmStrategy } from '../strategies/fcm.strategy';
import { Job } from 'bullmq';
import { NotificationPusherStrategy } from '../interfaces/notification-pusher.strategy';

@Processor('notification-pusher-queue', {
  limiter: { duration: 3000, max: 10 },
})
export class NotificationPusherProcessor extends WorkerHost {
  constructor(
    @Inject(FcmStrategy)
    private readonly notificationPusherStrategy: NotificationPusherStrategy,
  ) {
    super();
  }
  async process(job: Job): Promise<any> {
    try {
      await this.notificationPusherStrategy.sendNotification(job.data);
    } catch (err) {
      Logger.error(err);
      throw err;
    }
  }
}
