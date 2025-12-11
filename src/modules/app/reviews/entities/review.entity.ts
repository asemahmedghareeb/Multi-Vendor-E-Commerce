import { ObjectType, Field, Int } from '@nestjs/graphql';
import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
  RelationId,
} from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { Order } from '../../orders/entities/order.entity';
import { Vendor } from 'src/vendors/entities/vendor.entity';

@ObjectType()
@Entity('reviews')
@Unique(['user', 'vendor', 'order'])
export class Review extends BaseEntity {
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
