import { ObjectType, Field } from '@nestjs/graphql';
import {
  Entity,
  ManyToOne,
  JoinColumn,
  Unique,
  Index,
  RelationId,
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
  @JoinColumn({ name: 'follower_id' })
  follower: User;

  @Field()
  @RelationId((follow: Follow) => follow.follower)
  followerId: string;

  @Index()
  @Field(() => Vendor)
  @ManyToOne(() => Vendor, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'vendor_id' })
  vendor: Vendor;

  @Field()
  @RelationId((follow: Follow) => follow.vendor)
  vendorId: string;
}
