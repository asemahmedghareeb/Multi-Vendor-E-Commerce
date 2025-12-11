import { Injectable } from '@nestjs/common';
import { AppRepository } from 'src/modules/core/app-database/repositories/app.repository';
import { AdminGroup } from '../entities/admin-group.entity';
import { InjectAppRepository } from 'src/common/decorators/inject-app-repository.decorator';
import { AdminGroupPermission } from '../entities/admin-group-permission.entity';
import { SUPER_ADMIN_GROUP_NAME } from '../consts/super-admin-group-name.const';
import { AdminGroupScopeEnum } from 'src/common/enums/admin-group-scope.enum';
import { AppHttpException } from 'src/common/exceptions/app-http.exception';
import { ErrorCodeEnum } from 'src/common/enums/error-code.enum';
import { CreateAdminGroupInput } from '../dtos/inputs/create-admin-group.input';
import { DeepPartial, In, Not } from 'typeorm';
import { Permission } from '../entities/permission.entity';
import { PaginatorInput } from 'src/common/dtos/inputs/paginator.input';
import { updateAdminGroupInput } from '../dtos/inputs/update-admin-group.input';

@Injectable()
export class AdminGroupService {
  constructor(
    @InjectAppRepository(AdminGroup)
    private readonly adminGroupRepository: AppRepository<AdminGroup>,
    @InjectAppRepository(AdminGroupPermission)
    private readonly adminGroupPermissionRepository: AppRepository<AdminGroupPermission>,
    @InjectAppRepository(Permission)
    private readonly permissionRepository: AppRepository<Permission>,
  ) {}

  // SuperAdminLogic
  private async updateSuperAdminGroupPermissions(
    superAdminGroup: AdminGroup,
    permissionsIds: string[],
  ) {
    if (!superAdminGroup.adminGroupPermissions) {
      throw new Error('Can not reach adminGroupPermissions');
    }

    const adminGroupPermissionsToAdd: Partial<AdminGroupPermission>[] =
      permissionsIds
        .filter(
          (permissionId: string) =>
            !superAdminGroup.adminGroupPermissions.find(
              ({ permissionId: existedPermissionId }) =>
                existedPermissionId == permissionId,
            ),
        )
        .map((permissionId: string) => {
          return {
            permissionId,
            adminGroupId: superAdminGroup.id,
          };
        });

    await this.adminGroupPermissionRepository.bulkCreate(
      adminGroupPermissionsToAdd,
    );
    return superAdminGroup;
  }

  private async seedSuperAdminGroup(permissionsIds: string[]) {
    const superAdminGroup = await this.adminGroupRepository.createOne({
      name: SUPER_ADMIN_GROUP_NAME,
      description:
        'Full system access. Can manage users, permissions, groups, and all application data.',
      scope: AdminGroupScopeEnum.GLOBAL,
    });
    const groupPermissions: Partial<AdminGroupPermission>[] =
      permissionsIds.map((permissionId) => {
        return {
          permissionId,
          adminGroupId: superAdminGroup.id,
        };
      });

    this.adminGroupPermissionRepository.bulkCreate(groupPermissions);
    return superAdminGroup;
  }

  //AdminLogic
  async seedOrUpdateSuperAdminGroup(permissionsIds: string[]) {
    const existedSuperAdminGroup = await this.adminGroupRepository.findOne({
      where: {
        name: SUPER_ADMIN_GROUP_NAME,
      },
      relations: {
        adminGroupPermissions: true,
      },
    });

    if (existedSuperAdminGroup)
      return this.updateSuperAdminGroupPermissions(
        existedSuperAdminGroup,
        permissionsIds,
      );

    return this.seedSuperAdminGroup(permissionsIds);
  }

  async validateAdminGroupNotSuperAdmin(id: string) {
    const adminGroup = await this.adminGroupRepository.findOne({
      where: {
        id,
      },
    });
    if (!adminGroup)
      throw new AppHttpException(ErrorCodeEnum.SERVER_SIDE_ERROR, {
        message: 'adminGroupNotFound (validateAdminGroupNotSuperAdmin)',
      });
    if (adminGroup.name == SUPER_ADMIN_GROUP_NAME)
      throw new AppHttpException(ErrorCodeEnum.BAD_REQUEST_EXCEPTION, {
        message: 'superAdmin can not update his email',
      });
  }

  async createAdminGroup(input: CreateAdminGroupInput) {
    const existedAdminGroup = await this.adminGroupRepository.findOne({
      where: {
        name: input.name,
      },
    });

    if (existedAdminGroup) {
      throw new AppHttpException(
        ErrorCodeEnum.ADMIN_GROUP_WITH_THIS_NAME_ALREADY_EXIST,
      );
    }

    const permissions = await this.permissionRepository
      .createQueryBuilder('permission')
      .where(
        "CONCAT(permission.target, '.', permission.action) IN (:...codes)",
        { codes: input.permissionsCodes },
      )
      .getMany();

    if (permissions.length != input.permissionsCodes.length)
      throw new AppHttpException(ErrorCodeEnum.INVALID_PERMISSIONS_CODES_LIST);

    const adminGroup = await this.adminGroupRepository.createOne(input);

    const adminGroupPermissions: DeepPartial<AdminGroupPermission>[] =
      permissions.map(({ id: permissionId }) => {
        return {
          permissionId,
          adminGroupId: adminGroup.id,
        };
      });

    await this.adminGroupPermissionRepository.bulkCreate(adminGroupPermissions);

    return true;
  }

  async getAdminGroupById(adminGroupId: string) {
    const adminGroup = await this.adminGroupRepository.findOne({
      where: {
        id: adminGroupId,
      },
    });

    if (!adminGroup)
      throw new AppHttpException(ErrorCodeEnum.ADMIN_GROUP_DOES_NOT_EXIST);

    return adminGroup;
  }

  async updateAdminGroup(input: updateAdminGroupInput) {
    const adminGroup = await this.adminGroupRepository.findOne({
      where: {
        id: input.id,
      },
      relations: {
        adminGroupPermissions: !!input.permissionsCodes,
      },
    });

    if (!adminGroup) {
      throw new AppHttpException(ErrorCodeEnum.ADMIN_GROUP_DOES_NOT_EXIST);
    }

    if (adminGroup.name == SUPER_ADMIN_GROUP_NAME)
      throw new AppHttpException(ErrorCodeEnum.FORBIDDEN, {
        message: 'SuperAdmin admin group can not be updated',
      });

    if (input.name) {
      const existedAdminGroup = await this.adminGroupRepository.findOne({
        where: {
          id: Not(adminGroup.id),
          name: input.name,
        },
      });
      if (existedAdminGroup)
        throw new AppHttpException(
          ErrorCodeEnum.ADMIN_GROUP_WITH_THIS_NAME_ALREADY_EXIST,
        );
    }

    await this.adminGroupRepository.updateOneFromExistingModel(
      adminGroup,
      input,
    );

    if (!input.permissionsCodes) return true;

    const permissions = await this.permissionRepository
      .createQueryBuilder('permission')
      .where(
        "CONCAT(permission.target, '.', permission.action) IN (:...codes)",
        { codes: input.permissionsCodes },
      )
      .getMany();

    if (permissions.length != input.permissionsCodes.length)
      throw new AppHttpException(ErrorCodeEnum.INVALID_PERMISSIONS_CODES_LIST);

    const newPermissionsIds = permissions.map(({ id }) => id);

    const newPermissionsVis = {};
    newPermissionsIds.forEach((id) => (newPermissionsVis[id] = true));

    const currentPermissionsVis = {};
    adminGroup.adminGroupPermissions.forEach(
      ({ permissionId }) => (currentPermissionsVis[permissionId] = true),
    );

    const permissionsIdsToDelete: string[] = [];
    const permissionsIdsToAdd: string[] = [];

    adminGroup.adminGroupPermissions.forEach(({ permissionId }) => {
      if (!newPermissionsVis[permissionId])
        permissionsIdsToDelete.push(permissionId);
    });

    newPermissionsIds.forEach((id) => {
      if (!currentPermissionsVis[id]) permissionsIdsToAdd.push(id);
    });

    const newPermissions: Partial<AdminGroupPermission>[] =
      permissionsIdsToAdd.map((permissionId) => ({
        adminGroupId: adminGroup.id,
        permissionId,
      }));

    await this.adminGroupPermissionRepository.delete({
      permissionId: In(permissionsIdsToDelete),
      adminGroupId: adminGroup.id,
    });
    await this.adminGroupPermissionRepository.bulkCreate(newPermissions);

    return true;
  }

  async deleteAdminGroup(id: string) {
    const adminGroup = await this.adminGroupRepository.findOne({
      where: {
        id,
      },
    });

    if (!adminGroup)
      throw new AppHttpException(ErrorCodeEnum.ADMIN_GROUP_DOES_NOT_EXIST);

    if (adminGroup?.name == SUPER_ADMIN_GROUP_NAME)
      throw new AppHttpException(ErrorCodeEnum.FORBIDDEN, {
        message: 'SuperAdmin admin group can not be deleted',
      });

    await this.adminGroupRepository.softDelete(adminGroup.id);

    return true;
  }

  getAdminGroups(paginationInput?: PaginatorInput) {
    return this.adminGroupRepository.findPaginated(
      undefined,
      undefined,
      paginationInput?.page,
      paginationInput?.limit,
    );
  }
}
