import { Query, Resolver } from '@nestjs/graphql';
import { Permission } from '../entities/permission.entity';
import { PermissionService } from '../services/permission.service';
import { Auth } from 'src/common/decorators/auth.decorator';
import { UserRoleEnum } from 'src/common/enums/user-role.enum';
 import { PermissionPermissionsEnum } from '../enums/permissions-permissions.enum';

@Resolver(() => Permission)
export class PermissionResolver {
  constructor(private readonly permissionService: PermissionService) {}

  @Query(() => [Permission])
  @Auth({
    roles: [UserRoleEnum.ADMIN],
    permissions: [
      {
        target: Permission.permissionsTarget,
        action: PermissionPermissionsEnum.READ,
      },
    ],
  })
  adminGetAppPermissions() {
    return this.permissionService.getAllAppPermissions();
  }
}
