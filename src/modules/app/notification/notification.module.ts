import { Module } from '@nestjs/common';
import { NotificationService } from './services/notification.service';
import { NotificationResolver } from './resolvers/notification.resolver';
import { AppDatabaseModule } from 'src/modules/core/app-database/app-database.module';
import { Notification } from './entities/notification.entity';
import { NotificationReceiver } from './entities/notification-receiver.entity';
import { User } from '../auth-base/user/entities/user.entity';
import { Session } from '../auth-base/session/entities/session.entity';
import { NotificationPusherModule } from 'src/modules/core/notification-pusher/notification-pusher.module';

@Module({
  imports: [
    AppDatabaseModule.forFeature([
      Notification,
      NotificationReceiver,
      User,
      Session,
    ]),
    NotificationPusherModule,
  ],
  providers: [NotificationService, NotificationResolver],
  exports: [NotificationService],
})
export class NotificationModule {}
