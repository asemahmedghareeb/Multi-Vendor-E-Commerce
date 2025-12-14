import { Module } from '@nestjs/common';
import { VendorService } from './services/vendors.service';
import { UsersResolver } from './resolvers/vendors.resolver';
import { Vendor } from './entities/vendor.entity';
import { User } from '../auth-base/user/entities/user.entity';
import { Review } from '../reviews/entities/review.entity';
import { AppDatabaseModule } from 'src/modules/core/app-database/app-database.module';
import { AdminGroup } from '../auth-base/admin-group/entities/admin-group.entity';
import { MailModule } from 'src/modules/core/mail/mail.module';
import { Session } from '../auth-base/session/entities/session.entity';
import { NotificationPusherModule } from 'src/modules/core/notification-pusher/notification-pusher.module';

@Module({
  imports: [
    AppDatabaseModule.forFeature([User, Vendor, Review, AdminGroup, Session]),
    MailModule,
    NotificationPusherModule,
  ],
  providers: [UsersResolver, VendorService],
})
export class VendorsModule {}
