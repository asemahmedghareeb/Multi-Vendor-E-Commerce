import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { Transactional } from 'typeorm-transactional';
import { Auth } from 'src/common/decorators/auth.decorator';
import { UserRoleEnum } from 'src/common/enums/user-role.enum';
import { AdminGroup } from '../entities/admin-group.entity';
import { DefaultPermissionActionsEnum } from 'src/common/enums/default-permissions.enum';
import { CreateAdminGroupInput } from '../dtos/inputs/create-admin-group.input';
import { AdminGroupService } from '../services/admin-group.service';
import { PaginatedAdminGroupsResponse } from '../dtos/responses/paginated-admin-groups.response';
import { NullablePaginatorArgsInput } from 'src/common/dtos/inputs/paginator.input';
import { updateAdminGroupInput } from '../dtos/inputs/update-admin-group.input';
import { Permission } from '../entities/permission.entity';
import { PermissionsByAdminGroupIdDataLoader } from '../dataloaders/permissions.dataloader';

@Resolver(() => AdminGroup)
export class AdminGroupResolver {
  constructor(
    private readonly adminGroupService: AdminGroupService,
    private readonly permissionsByAdminGroupIdDataLoader: PermissionsByAdminGroupIdDataLoader,
  ) {}

  @Query(() => AdminGroup)
  @Auth({
    roles: [UserRoleEnum.ADMIN],
    permissions: [
      {
        target: AdminGroup.permissionsTarget,
        action: DefaultPermissionActionsEnum.READ,
      },
    ],
  })
  adminGetAdminGroup(@Args('id') id: string) {
    return this.adminGroupService.getAdminGroupById(id);
  }

  @Query(() => PaginatedAdminGroupsResponse)
  @Auth({
    roles: [UserRoleEnum.ADMIN],
    permissions: [
      {
        target: AdminGroup.permissionsTarget,
        action: DefaultPermissionActionsEnum.READ,
      },
    ],
  })
  adminGetAdminGroups(
    @Args({ nullable: true }) paginationInput: NullablePaginatorArgsInput,
  ) {
    return this.adminGroupService.getAdminGroups(paginationInput.paginate);
  }

  @Mutation(() => Boolean)
  @Transactional()
  @Auth({
    roles: [UserRoleEnum.ADMIN],
    permissions: [
      {
        target: AdminGroup.permissionsTarget,
        action: DefaultPermissionActionsEnum.CREATE,
      },
    ],
  })
  adminCreateAdminGroup(@Args('input') input: CreateAdminGroupInput) {
    return this.adminGroupService.createAdminGroup(input);
  }

  @Mutation(() => Boolean)
  @Transactional()
  @Auth({
    roles: [UserRoleEnum.ADMIN],
    permissions: [
      {
        target: AdminGroup.permissionsTarget,
        action: DefaultPermissionActionsEnum.UPDATE,
      },
    ],
  })
  adminUpdateAdminGroup(@Args('input') input: updateAdminGroupInput) {
    return this.adminGroupService.updateAdminGroup(input);
  }

  @Mutation(() => Boolean)
  @Transactional()
  @Auth({
    roles: [UserRoleEnum.ADMIN],
    permissions: [
      {
        target: AdminGroup.permissionsTarget,
        action: DefaultPermissionActionsEnum.DELETE,
      },
    ],
  })
  adminDeleteAdminGroup(@Args('id') id: string) {
    return this.adminGroupService.deleteAdminGroup(id);
  }

  @ResolveField(() => [Permission])
  permissions(@Parent() adminGroup: AdminGroup) {
    const loader = this.permissionsByAdminGroupIdDataLoader.getDataloader();
    return loader.load(adminGroup.id);
  }
}
