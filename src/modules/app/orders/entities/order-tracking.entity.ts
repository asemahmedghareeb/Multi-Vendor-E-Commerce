import { ObjectType, Field } from '@nestjs/graphql';
import { Entity, Column, ManyToOne, JoinColumn, RelationId } from 'typeorm'; // <--- Import RelationId
import { BaseEntity } from '../../common/entities/base.entity';
import { OrderItem } from './order-item.entity';
import { OrderStatus } from '../enum/order-status.enum';

@ObjectType()
@Entity('order_tracking')
export class OrderTracking extends BaseEntity {
  @Field(() => OrderStatus)
  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  remarks: string;

  @ManyToOne(() => OrderItem, (item) => item.trackingHistory, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'order_item_id' })
  orderItem: OrderItem;

  @RelationId((tracking: OrderTracking) => tracking.orderItem)
  orderItemId: string;
}
