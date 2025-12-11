import { Injectable } from '@nestjs/common';
import { InjectAppRepository } from 'src/common/decorators/inject-app-repository.decorator';
import { Permission } from '../entities/permission.entity';
import { AppRepository } from 'src/modules/core/app-database/repositories/app.repository';
import { AppDataSource } from 'src/config/database/app.datasource';
import { In, Not } from 'typeorm';
import { PaginatorInput } from 'src/common/dtos/inputs/paginator.input';
import { CustomPermissions } from '../consts/custom-permissions.const';

@Injectable()
export class PermissionService {
  constructor(
    @InjectAppRepository(Permission)
    private readonly permissionRepository: AppRepository<Permission>,
    private readonly appDataSource: AppDataSource,
  ) {}

  async seedPermissions(): Promise<Permission[]> {
    const targets: string[] = [];
    const allPermissions: Permission[] = [];

    for (const data of [
      ...this.appDataSource.entityMetadatas,
      ...Object.entries(CustomPermissions),
    ]) {
      let newPermissions: string[] = [];
      let target: string;

      // @ts-ignore
      if (data?.target) {
        {
          newPermissions = Object.values(
            // @ts-ignore
            data.target.permissionActionsEnum || [],
          );
          // @ts-ignore
          target = data.targetName;
        }
      } else {
        target = data[0];
        newPermissions = Object.values(data[1] || []);
      }

      targets.push(target);

      const existedPermissions = await this.permissionRepository.find({
        where: {
          target,
        },
      });

      const permissionsToDelete = existedPermissions.filter(
        ({ action: action }) => !newPermissions.includes(action),
      );

      if (permissionsToDelete.length)
        await this.permissionRepository.remove(permissionsToDelete);

      const permissionsToAdd = newPermissions.filter(
        (action) =>
          !existedPermissions.find(
            ({ action: existedAction }) => existedAction == action,
          ),
      );

      if (permissionsToAdd.length) {
        allPermissions.push(
          ...(await this.permissionRepository.bulkCreate(
            permissionsToAdd.map((action) => {
              return {
                action,
                target,
              };
            }),
          )),
        );
      }

      allPermissions.push(
        ...existedPermissions.filter(
          (permission) =>
            !permissionsToDelete.find(
              (deletedPermission) => deletedPermission.id == permission.id,
            ),
        ),
      );
    }

    await this.permissionRepository.deleteMany({
      target: Not(In(targets)),
    });

    return allPermissions;
  }

  getAllAppPermissions() {
    return this.permissionRepository.find();
  }
}
