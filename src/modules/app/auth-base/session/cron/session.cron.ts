import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectAppRepository } from 'src/common/decorators/inject-app-repository.decorator';
import { AppRepository } from 'src/modules/core/app-database/repositories/app.repository';
import { Session } from '../entities/session.entity';
import { AppConfig } from 'src/config/app.config';

@Injectable()
export class SessionCron {
  constructor(
    @InjectAppRepository(Session)
    private readonly sessionRepository: AppRepository<Session>,
  ) {}
  @Cron('0 4 * * *')
  // todo use in case u want remove expired sessions
  // todo make sure the system monitoring is off if u will remove expired sessions
  async removeExpiredSessions() {
    if (AppConfig.monitorUserActivity) return;
    try {
      await this.sessionRepository
        .createQueryBuilder()
        .delete()
        .where('refreshExpiryDate < :now', { now: new Date() })
        .execute();
    } catch (err) {
      Logger.error(err);
    }
  }
}
