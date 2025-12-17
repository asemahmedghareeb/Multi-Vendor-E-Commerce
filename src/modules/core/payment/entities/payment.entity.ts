import { User } from 'src/modules/app/auth-base/user/entities/user.entity';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { PaymentStatusEnum } from '../enums/payment-status.enum';
import { AppBaseEntity } from '../../app-database/entities/app-base.entity';
import { PaymentGatewaysEnum } from '../enums/payment-gateways.enum';
import { Field, Float, ObjectType } from '@nestjs/graphql';
import { Order } from 'src/modules/app/orders/entities/order.entity';
import { Refund } from './refund.entity';

@Entity()
@ObjectType()
export class Payment extends AppBaseEntity {
  @Column({ type: 'enum', enum: PaymentGatewaysEnum })
  @Field(() => PaymentGatewaysEnum)
  paymentGateway: PaymentGatewaysEnum; // 'stripe' | 'myfatoorah'

  @Column()
  @Field()
  @Index()
  externalId: string; // pm_xxx (Stripe) | tokenId (MyFatoorah)

  @Column()
  @Field()
  amount: number;

  @Column()
  @Field()
  currency: string;

  @Column({
    type: 'enum',
    enum: PaymentStatusEnum,
    default: PaymentStatusEnum.INCOMPLETE,
  })
  @Field(() => PaymentStatusEnum)
  paymentStatus: PaymentStatusEnum;

  @Field()
  clientSecret: string;

  @Column({
    type: 'json',
    nullable: false,
    default: () => `'{}'`,
  })
  metadata: Record<string, any>;

  @Column()
  userId: string;

  @Field(() => Float)
  @Column({
    name: 'amount_refunded',
    type: 'bigint',
    default: 0,
    transformer: { to: (v) => v, from: (v) => parseInt(v, 10) },
  })
  amountRefunded: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToOne(() => Order, (order) => order.payment)
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @Column({ nullable: true })
  orderId?: string;

  @Field(() => [Refund], { nullable: true })
  @OneToMany(() => Refund, (refund) => refund.payment)
  refunds: Refund[];
}
