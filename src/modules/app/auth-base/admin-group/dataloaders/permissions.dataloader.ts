import * as DataLoader from 'dataloader';
import { AppDataloader } from 'src/common/interfaces/dataloader.interface';
import { Permission } from '../entities/permission.entity';
import { AppRequestScopedDataloader } from 'src/common/decorators/app-request-scoped-dataloader.decorator';
import { AppRepository } from 'src/modules/core/app-database/repositories/app.repository';
import { AdminGroupPermission } from '../entities/admin-group-permission.entity';
import { In } from 'typeorm';
import { InjectAppRepository } from 'src/common/decorators/inject-app-repository.decorator';

@AppRequestScopedDataloader()
export class PermissionsByAdminGroupIdDataLoader
  implements AppDataloader<string, Permission[]>
{
  loader: DataLoader<string, Permission[]>;

  constructor(
    @InjectAppRepository(AdminGroupPermission)
    private readonly adminGroupPermission: AppRepository<AdminGroupPermission>,
  ) {
    this.loader = new DataLoader((adminGroupIds: string[]) =>
      this.getPermissionsByAdminGroupIds(adminGroupIds),
    );
  }

  private async getPermissionsByAdminGroupIds(adminGroupIds: string[]) {
    const adminGroupPermissions = await this.adminGroupPermission.find({
      where: {
        adminGroupId: In(adminGroupIds),
      },
      relations: {
        permission: true,
      },
    });

    const permissionsMap = {};

    adminGroupPermissions.forEach(({ adminGroupId, permission }) => {
      if (!permissionsMap[adminGroupId]) permissionsMap[adminGroupId] = [];
      permissionsMap[adminGroupId].push(permission);
    });

    return adminGroupIds.map((adminGroupId) => permissionsMap[adminGroupId]);
  }

  getDataloader(): DataLoader<string, Permission[]> {
    return this.loader;
  }
}
