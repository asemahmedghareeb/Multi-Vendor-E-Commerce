import { ObjectType, Field, Int } from '@nestjs/graphql';
import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
  RelationId,
} from 'typeorm';

import { Order } from '../../orders/entities/order.entity';

import { AppBaseEntity } from 'src/modules/core/app-database/entities/app-base.entity';
import { User } from '../../auth-base/user/entities/user.entity';
import { Vendor } from '../../vendors/entities/vendor.entity';
import { GeneratePermissions } from 'src/common/decorators/generate-entity-permissions.decorator';

@ObjectType()
@Entity('reviews')
@Unique(['user', 'vendor', 'order'])
@GeneratePermissions()
export class Review extends AppBaseEntity {
  @Field(() => Int)
  @Column({ type: 'int' })
  rating: number;

  @Field()
  @Column({ type: 'text' })
  comment: string;

  @Field(() => User)
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @RelationId((review: Review) => review.user)
  userId: string;

  @Field(() => Vendor)
  @ManyToOne(() => Vendor, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'vendor_id' })
  vendor: Vendor;


  @RelationId((review: Review) => review.vendor)
  vendorId: string;

  @Field(() => Order)
  @ManyToOne(() => Order, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @RelationId((review: Review) => review.order)
  orderId: string;
}
