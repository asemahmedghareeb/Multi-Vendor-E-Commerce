import * as Dataloader from 'dataloader';
import { AppRequestScopedDataloader } from 'src/common/decorators/app-request-scoped-dataloader.decorator';
import { AdminGroup } from '../../admin-group/entities/admin-group.entity';
import { InjectAppRepository } from 'src/common/decorators/inject-app-repository.decorator';
import { AppRepository } from 'src/modules/core/app-database/repositories/app.repository';
import { In } from 'typeorm';
import { AppDataloader } from 'src/common/interfaces/dataloader.interface';

@AppRequestScopedDataloader()
export class AdminGroupDataloader implements AppDataloader<string, AdminGroup> {
  loader: Dataloader<string, AdminGroup>;

  constructor(
    @InjectAppRepository(AdminGroup)
    private readonly adminGroupRepository: AppRepository<AdminGroup>,
  ) {
    this.loader = new Dataloader((adminGroupIds: string[]) =>
      this.getAdminGroupsByIds(adminGroupIds),
    );
  }

  private async getAdminGroupsByIds(adminGroupIds: string[]) {
    const adminGroups = await this.adminGroupRepository.find({
      where: {
        id: In(adminGroupIds),
      },
    });

    const adminGroupMap = {};

    adminGroups.forEach((adminGroup) => {
      adminGroupMap[adminGroup.id] = adminGroup;
    });

    return adminGroupIds.map((id) => adminGroupMap[id]);
  }

  getDataloader(): Dataloader<string, AdminGroup> {
    return this.loader;
  }
}
