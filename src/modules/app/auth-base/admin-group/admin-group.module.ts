import { Module } from '@nestjs/common';
import { AdminGroupService } from './services/admin-group.service';
import { AppDatabaseModule } from 'src/modules/core/app-database/app-database.module';
import { AdminGroupPermission } from './entities/admin-group-permission.entity';
import { AdminGroup } from './entities/admin-group.entity';
import { Permission } from './entities/permission.entity';
import { PermissionService } from './services/permission.service';
import { PermissionResolver } from './resolvers/permission.resolver';
import { AdminGroupResolver } from './resolvers/admin-group.resolver';
import { PermissionsByAdminGroupIdDataLoader } from './dataloaders/permissions.dataloader';

@Module({
  imports: [
    AppDatabaseModule.forFeature([
      AdminGroupPermission,
      AdminGroup,
      Permission,
    ]),
  ],
  providers: [
    AdminGroupService,
    PermissionService,
    PermissionResolver,
    AdminGroupResolver,
    PermissionsByAdminGroupIdDataLoader,
  ],
  exports: [AdminGroupService, PermissionService],
})
export class adminGroupModule {
  constructor() {}
}
