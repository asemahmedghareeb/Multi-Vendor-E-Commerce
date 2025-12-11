import { ObjectType, Field } from '@nestjs/graphql';
import {
  Entity,
  ManyToOne,
  JoinColumn,
  Unique,
  Index,
  RelationId,
} from 'typeorm'; 
import { BaseEntity } from '../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { Vendor } from 'src/vendors/entities/vendor.entity';

@ObjectType()
@Entity('follows')
@Unique(['follower', 'vendor'])
export class Follow extends BaseEntity {
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
