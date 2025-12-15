import { ObjectType, Field } from '@nestjs/graphql';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm'; 
import { OrderItem } from './order-item.entity';
import { OrderStatus } from '../enum/order-status.enum';
import { AppBaseEntity } from 'src/modules/core/app-database/entities/app-base.entity';
import { GeneratePermissions } from 'src/common/decorators/generate-entity-permissions.decorator';

@ObjectType()
@Entity('order_tracking')
@GeneratePermissions()
export class OrderTracking extends AppBaseEntity {
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
  @JoinColumn({ name: 'orderItemId' })
  orderItem: OrderItem;

  @Column()
  orderItemId: string;
}
