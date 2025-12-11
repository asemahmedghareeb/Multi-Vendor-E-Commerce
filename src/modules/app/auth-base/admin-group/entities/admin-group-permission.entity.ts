import { AppBaseEntity } from 'src/modules/core/app-database/entities/app-base.entity';
import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { Permission } from './permission.entity';
import { AdminGroup } from './admin-group.entity';

@Entity()
@Unique(['permissionId', 'adminGroupId'])
export class AdminGroupPermission extends AppBaseEntity {
  @Column()
  permissionId: string;

  @ManyToOne(
    () => Permission,
    (permission) => permission.adminGroupPermissions,
    { onDelete: 'CASCADE', onUpdate: 'CASCADE' },
  )
  @JoinColumn({ name: 'permissionId' })
  permission: Permission;

  @Column()
  adminGroupId: string;

  @ManyToOne(() => AdminGroup, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'adminGroupId' })
  adminGroup: AdminGroup;
}
