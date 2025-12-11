import * as Dataloader from 'dataloader';
import { AppRequestScopedDataloader } from 'src/common/decorators/app-request-scoped-dataloader.decorator';
import { AppDataloader } from 'src/common/interfaces/dataloader.interface';
import { User } from '../../user/entities/user.entity';
import { InjectAppRepository } from 'src/common/decorators/inject-app-repository.decorator';
import { AppRepository } from 'src/modules/core/app-database/repositories/app.repository';
import { In } from 'typeorm';

@AppRequestScopedDataloader()
export class UserDataloader implements AppDataloader<string, User> {
  loader: Dataloader<string, User>;

  constructor(
    @InjectAppRepository(User)
    private readonly userRepository: AppRepository<User>,
  ) {
    this.loader = new Dataloader((userIds: string[]) =>
      this.getUsersByIds(userIds),
    );
  }

  private async getUsersByIds(userIds: string[]) {
    const users = await this.userRepository.find({
      where: {
        id: In(userIds),
      },
    });

    const userMap = {};

    users.forEach((user) => (userMap[user.id] = user));

    return userIds.map((id) => userMap[id]);
  }

  getDataloader(): Dataloader<string, User> {
    return this.loader;
  }
}
