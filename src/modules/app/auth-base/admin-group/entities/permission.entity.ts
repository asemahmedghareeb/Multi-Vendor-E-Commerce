import { AppBaseEntity } from 'src/modules/core/app-database/entities/app-base.entity';
import { Column, Entity, OneToMany, Unique } from 'typeorm';
import { AdminGroupPermission } from './admin-group-permission.entity';
import { Field, ObjectType } from '@nestjs/graphql';
import { GeneratePermissions } from 'src/common/decorators/generate-entity-permissions.decorator';
import { PermissionPermissionsEnum } from '../enums/permissions-permissions.enum';

@Entity()
@ObjectType()
@Unique(['target', 'action'])
@GeneratePermissions(PermissionPermissionsEnum)
export class Permission extends AppBaseEntity {
  @Column()
  @Field()
  action: string;

  @Column()
  @Field()
  target: string;

  @Field(() => String)
  get code() {
    return `${this.target}.${this.action}`;
  }

  @OneToMany(
    () => AdminGroupPermission,
    (adminGroupPermission) => adminGroupPermission.permission,
  )
  adminGroupPermissions: AdminGroupPermission[];
}
