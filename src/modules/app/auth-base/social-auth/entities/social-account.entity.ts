import { Field, ObjectType } from '@nestjs/graphql';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { SocialProviderEnum } from '../enums/social-provider.enum';
import { User } from '../../user/entities/user.entity';
import { AppBaseEntity } from 'src/modules/core/app-database/entities/app-base.entity';
import { SocialAccountPermissionsEnum } from '../enums/social-account-permissions.enum';
import { GeneratePermissions } from 'src/common/decorators/generate-entity-permissions.decorator';

@Entity()
@ObjectType()
@Index(['socialProvider', 'socialId'], { unique: true })
@GeneratePermissions(SocialAccountPermissionsEnum)
export class SocialAccount extends AppBaseEntity {
  @Field()
  @Column()
  socialId: string;

  @Field(() => SocialProviderEnum)
  @Column({ type: 'enum', enum: SocialProviderEnum })
  socialProvider: SocialProviderEnum;

  @Field()
  @Column()
  userId: string;

  @ManyToOne(() => User, (user) => user.socialAccounts, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({
    name: 'userId',
  })
  user: User;
}
