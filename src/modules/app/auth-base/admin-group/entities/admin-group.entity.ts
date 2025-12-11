import { AppBaseEntity } from 'src/modules/core/app-database/entities/app-base.entity';
import { Column, Entity, Index, OneToMany, Unique } from 'typeorm';
import { AdminGroupPermission } from './admin-group-permission.entity';
import { User } from '../../user/entities/user.entity';
import { AdminGroupScopeEnum } from 'src/common/enums/admin-group-scope.enum';
import { GeneratePermissions } from 'src/common/decorators/generate-entity-permissions.decorator';
import { Field, ObjectType } from '@nestjs/graphql';

@Entity()
@ObjectType()
@GeneratePermissions()
export class AdminGroup extends AppBaseEntity {
  @Column({ unique: true })
  @Index()
  @Field()
  name: string;

  @Column()
  @Field()
  description: string;

  @Column({ type: 'enum', enum: AdminGroupScopeEnum })
  @Field()
  scope: AdminGroupScopeEnum;

  @OneToMany(
    () => AdminGroupPermission,
    (adminGroupPermission) => adminGroupPermission.adminGroup,
  )
  adminGroupPermissions: AdminGroupPermission[];

  @OneToMany(() => User, (user) => user.adminGroup)
  users: User[];
}
