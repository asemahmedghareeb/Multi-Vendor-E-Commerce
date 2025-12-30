import { ObjectType, Field, Int, Float } from '@nestjs/graphql';
import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Order } from './order.entity';
import { OrderTracking } from './order-tracking.entity';
import { OrderStatus } from '../enum/order-status.enum';
import { AppBaseEntity } from 'src/modules/core/app-database/entities/app-base.entity';
import { Product } from '../../product/entities/product.entity';
import { Vendor } from '../../vendors/entities/vendor.entity';
import { GeneratePermissions } from 'src/common/decorators/generate-entity-permissions.decorator';
import { MoneyScalar } from 'src/common/scalars/money.scalar';

@ObjectType()
@Entity('order_items')
@GeneratePermissions()
export class OrderItem extends AppBaseEntity {
  @Field(() => Int)
  @Column({ type: 'int' })
  quantity: number;

  @Field(() => MoneyScalar)
  @Column({
    type: 'bigint',
    // transformer: {
    //   to: (value: number) => value,
    //   from: (value: string) => parseInt(value, 10),
    // },
  })
  priceAtPurchase: number;

  @Field(() => OrderStatus)
  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  @Field(() => Order)
  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @Column()
  orderId: string;

  @Field(() => Product)
  @ManyToOne(() => Product, { nullable: true })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column()
  productId: string;

  @Field(() => Vendor)
  @ManyToOne(() => Vendor)
  @JoinColumn({ name: 'vendorId' })
  vendor: Vendor;

  @Column()
  vendorId: string;

  @Field(() => Int)
  @Column({ type: 'int', default: 0 })
  refundedQuantity: number;

  @OneToMany(() => OrderTracking, (tracking) => tracking.orderItem)
  trackingHistory: OrderTracking[];
}
