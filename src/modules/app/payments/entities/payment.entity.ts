import { ObjectType, Field, Float, registerEnumType } from '@nestjs/graphql';
import {
  Entity,
  Column,
  OneToOne,
  JoinColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Order } from '../../orders/entities/order.entity';
import { Refund } from './refund.entity';

export enum PaymentStatus {
  PENDING = 'PENDING',
  REQUIRES_ACTION = 'REQUIRES_ACTION',
  PROCESSING = 'PROCESSING',
  SUCCEEDED = 'SUCCEEDED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED',
}

registerEnumType(PaymentStatus, { name: 'PaymentStatus' });

@ObjectType()
@Entity('payments')
export class Payment extends BaseEntity {
  @Field(() => Order)
  @OneToOne(() => Order, (order) => order.payment, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({ name: 'order_id', type: 'uuid' })
  orderId: string;

  @Field()
  @Column({ name: 'stripe_payment_id', unique: true })
  @Index()
  stripePaymentId: string;

  @Field({ nullable: true })
  @Column({ name: 'stripe_client_secret', nullable: true })
  stripeClientSecret: string;

  @Field(() => Float)
  @Column({
    type: 'bigint',
    transformer: { to: (v) => v, from: (v) => parseInt(v, 10) },
  })
  amount: number;

  @Field(() => Float)
  @Column({
    name: 'amount_captured',
    type: 'bigint',
    default: 0,
    transformer: { to: (v) => v, from: (v) => parseInt(v, 10) },
  })
  amountCaptured: number;

  @Field(() => Float)
  @Column({
    name: 'amount_refunded',
    type: 'bigint',
    default: 0,
    transformer: { to: (v) => v, from: (v) => parseInt(v, 10) },
  })
  amountRefunded: number;

  @Field(() => [Refund], { nullable: true })
  @OneToMany(() => Refund, (refund) => refund.payment)
  refunds: Refund[];

  @Field()
  @Column({ default: 'USD' })
  currency: string;

  @Field()
  @Column({ default: 'STRIPE' })
  provider: string;

  @Field(() => PaymentStatus)
  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  status: PaymentStatus;

  @Column({ type: 'jsonb', nullable: true })
  metadata: any;
}
