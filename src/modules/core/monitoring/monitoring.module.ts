import { Module } from '@nestjs/common';
import { MonitoringService } from './services/monitoring.service';
import { UserActivityResolver } from './resolvers/user-activity.resolver';
import { AppDatabaseModule } from '../app-database/app-database.module';
import { UserActivity } from './entities/user-activity.entity';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { MonitoringInterceptor } from './interceptors/monitoring.interceptor';
import { MonitoringProcessor } from './processors/monitoring.processor';
import { BullModule } from '@nestjs/bullmq';
import { Session } from 'src/modules/app/auth-base/session/entities/session.entity';
import { SessionDataloader } from './dataloaders/session.dataloader';

@Module({
  imports: [
    AppDatabaseModule.forFeature([UserActivity, Session]),
    BullModule.registerQueue({
      name: 'monitoring-queue',
    }),
  ],
  providers: [
    MonitoringService,
    UserActivityResolver,
    MonitoringProcessor,
    SessionDataloader,
    {
      provide: APP_INTERCEPTOR,
      useClass: MonitoringInterceptor,
    },
  ],
  exports: [],
})
export class MonitoringModule {}
