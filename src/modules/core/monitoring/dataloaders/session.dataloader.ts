import * as DataLoader from 'dataloader';
import { AppRequestScopedDataloader } from 'src/common/decorators/app-request-scoped-dataloader.decorator';
import { InjectAppRepository } from 'src/common/decorators/inject-app-repository.decorator';
import { AppDataloader } from 'src/common/interfaces/dataloader.interface';
import { Session } from 'src/modules/app/auth-base/session/entities/session.entity';
import { AppRepository } from '../../app-database/repositories/app.repository';
import { In } from 'typeorm';

@AppRequestScopedDataloader()
export class SessionDataloader implements AppDataloader<string, Session> {
  loader: DataLoader<string, Session>;

  constructor(
    @InjectAppRepository(Session)
    private readonly sessionRepository: AppRepository<Session>,
  ) {
    this.loader = new DataLoader((sessionIds: string[]) =>
      this.getSessionsByIds(sessionIds),
    );
  }

  private async getSessionsByIds(sessionIds: string[]) {
    const sessions = await this.sessionRepository.find({
      where: {
        id: In(sessionIds),
      },
    });

    const sessionMap = {};

    sessions.forEach((session) => (sessionMap[session.id] = session));

    return sessionIds.map((id) => sessionMap[id]);
  }

  getDataloader(): DataLoader<string, Session> {
    return this.loader;
  }
}
