import { Module } from '@nestjs/common';
import { SessionService } from './services/session.service';
import { AppDatabaseModule } from 'src/modules/core/app-database/app-database.module';
import { Session } from './entities/session.entity';
import { RefreshSessionGuard } from './guards/refresh-session.guard';
import { SessionResolver } from './resolvers/session.resolver';
import { SessionCron } from './cron/session.cron';
import { UserDataloader } from './dataloaders/user.dataloader';
import { User } from '../user/entities/user.entity';

@Module({
  imports: [AppDatabaseModule.forFeature([Session, User])],
  providers: [
    SessionService,
    RefreshSessionGuard,
    SessionResolver,
    SessionCron,
    UserDataloader,
  ],
  exports: [SessionService, UserDataloader],
})
export class SessionModule {}
