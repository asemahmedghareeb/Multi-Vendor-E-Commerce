import { Module } from '@nestjs/common';
import { UserService } from './services/user.service';
import { AppDatabaseModule } from 'src/modules/core/app-database/app-database.module';
import { User } from './entities/user.entity';
import { UserVerificationCode } from './entities/user-verification-code.entity';
import { UserVerificationCodeResolver } from './resolvers/user-verification-code.resolver';
import { UserVerificationCodeService } from './services/user-verification-code.service';
import { MailModule } from 'src/modules/core/mail/mail.module';
import { SmsModule } from 'src/modules/core/sms/sms.module';
import { UserCron } from './crons/user.cron';
import { SeedSuperAdminService } from './services/seed-super-admin.service';
import { adminGroupModule } from '../admin-group/admin-group.module';
import { UserResolver } from './resolvers/user.resolver';
import { AdminGroup } from '../admin-group/entities/admin-group.entity';
import { RequestVerificationService } from './services/request-verification-code.service';
import { AdminGroupDataloader } from './dataloaders/admin-group.dataloader';
import { Wallet } from '../../wallet/entities/wallet.entity';

@Module({
  imports: [
    AppDatabaseModule.forFeature([User, UserVerificationCode, AdminGroup,Wallet]),
    MailModule,
    SmsModule,
    adminGroupModule,
  ],
  providers: [
    UserService,
    UserVerificationCode,
    UserVerificationCodeResolver,
    UserVerificationCodeService,
    UserCron,
    SeedSuperAdminService,
    UserResolver,
    RequestVerificationService,
    AdminGroupDataloader,
  ],
  exports: [UserService, UserVerificationCodeService],
})
export class UserModule {}
