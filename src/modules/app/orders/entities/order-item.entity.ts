
import {
  ObjectType,
  Field,
  Int,
  Float,
  registerEnumType,
} from '@nestjs/graphql';
import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  RelationId,
} from 'typeorm';

import { Order } from './order.entity';

import { OrderTracking } from './order-tracking.entity';
import { OrderStatus } from '../enum/order-status.enum';
import { AppBaseEntity } from 'src/modules/core/app-database/entities/app-base.entity';
import { Product } from '../../product/entities/product.entity';
import { Vendor } from '../../vendors/entities/vendor.entity';
import { GeneratePermissions } from 'src/common/decorators/generate-entity-permissions.decorator';

@ObjectType()
@Entity('order_items')
@GeneratePermissions()
export class OrderItem extends AppBaseEntity {
  @Field(() => Int)
  @Column({ type: 'int' })
  quantity: number;

  @Field(() => Float)
  @Column({
    type: 'bigint',
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseInt(value, 10),
    },
  })
  priceAtPurchase: number;

  @Field(() => OrderStatus)
  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  @Field(() => Order)
  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @RelationId((item: OrderItem) => item.order)
  orderId: string;

  @Field(() => Product)
  @ManyToOne(() => Product, { nullable: true })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @RelationId((item: OrderItem) => item.product)
  productId: string;

  @Field(() => Vendor)
  @ManyToOne(() => Vendor)
  @JoinColumn({ name: 'vendor_id' })
  vendor: Vendor;

  @RelationId((item: OrderItem) => item.vendor)
  vendorId: string;

  @Field(() => Int)
  @Column({ type: 'int', default: 0 })
  refundedQuantity: number;

  @Field(() => [OrderTracking], { nullable: true })
  @OneToMany(() => OrderTracking, (tracking) => tracking.orderItem)
  trackingHistory: OrderTracking[];
}
