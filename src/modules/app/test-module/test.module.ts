import { Module } from '@nestjs/common';
import { TestResolver } from './test.resolver';
import { AppDatabaseModule } from 'src/modules/core/app-database/app-database.module';
import { TestEntity } from './entities/test.entity';
import { MailModule } from 'src/modules/core/mail/mail.module';
import { SmsModule } from 'src/modules/core/sms/sms.module';
import { NotificationPusherModule } from 'src/modules/core/notification-pusher/notification-pusher.module';
import { PaymentModule } from 'src/modules/app/payment/payment.module';
import { File } from 'src/modules/core/media/entities/file.entity';

@Module({
  imports: [
    AppDatabaseModule.forFeature([TestEntity, File]),
    MailModule,
    SmsModule,
    NotificationPusherModule,
    PaymentModule,
  ],
  providers: [TestResolver],
  exports: [],
})
export class testModule {}
