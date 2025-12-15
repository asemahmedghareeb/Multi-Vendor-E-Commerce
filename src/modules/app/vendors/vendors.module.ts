import { Module } from '@nestjs/common';
import { VendorService } from './services/vendors.service';
import { Vendor } from './entities/vendor.entity';
import { User } from '../auth-base/user/entities/user.entity';
import { AppDatabaseModule } from 'src/modules/core/app-database/app-database.module';
import { AdminGroup } from '../auth-base/admin-group/entities/admin-group.entity';
import { MailModule } from 'src/modules/core/mail/mail.module';
import { NotificationModule } from '../notification/notification.module';
import { UserDataloader } from '../auth-base/session/dataloaders/user.dataloader';
import { SessionModule } from '../auth-base/session/session.module';
import { Review } from '../reviews/entities/review.entity';
import { Product } from '../product/entities/product.entity';
import { OrderItem } from '../orders/entities/order-item.entity';

@Module({
  imports: [
    AppDatabaseModule.forFeature([
      User,
      Vendor,
      Review,
      AdminGroup,
      Product,
      OrderItem,
    ]),
    MailModule,
    NotificationModule,
    SessionModule,
  ],
  providers: [VendorService, UserDataloader],
})
export class VendorsModule {}
