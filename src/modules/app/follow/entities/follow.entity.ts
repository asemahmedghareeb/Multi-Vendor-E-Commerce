import { ObjectType, Field } from '@nestjs/graphql';
import {
  Entity,
  ManyToOne,
  JoinColumn,
  Unique,
  Index,
  Column,
} from 'typeorm'; 

import { AppBaseEntity } from 'src/modules/core/app-database/entities/app-base.entity';
import { User } from '../../auth-base/user/entities/user.entity';
import { Vendor } from '../../vendors/entities/vendor.entity';

@ObjectType()
@Entity('follows')
@Unique(['follower', 'vendor'])
export class Follow extends AppBaseEntity {
  @Index()
  @Field(() => User)
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'followerId' })
  follower: User;

  @Column()
  followerId: string;

  @Index()
  @Field(() => Vendor)
  @ManyToOne(() => Vendor, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'vendorId' })
  vendor: Vendor;

  @Column()
  vendorId: string;
}
