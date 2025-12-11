import { Module } from '@nestjs/common';
import { FcmStrategy } from './strategies/fcm.strategy';
import { NotificationPusherService } from './services/notification-pusher.service';
import { NotificationPusherProcessor } from './processors/notification-pusher.processor';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'notification-pusher-queue',
    }),
  ],
  providers: [
    NotificationPusherService,
    FcmStrategy,
    NotificationPusherProcessor,
  ],
  exports: [NotificationPusherService],
})
export class NotificationPusherModule {}
