import { ObjectType, Field, Float } from '@nestjs/graphql';
import { Entity, Column, ManyToOne, OneToMany, JoinColumn, OneToOne } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { OrderItem } from './order-item.entity';
import { Payment } from 'src/payments/entities/payment.entity';
import { OrderStatus } from '../enum/order-status.enum';


@ObjectType()
@Entity('orders')
export class Order extends BaseEntity {

  @Field(() => User)
  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id', nullable: true })
  userId: string;

  @Field(() => Float)
  @Column({ 
    type: 'bigint',
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseInt(value, 10),
    }
  }) 
  totalAmount: number; 


  @Field(() => String)
  @Column({ type: 'jsonb' }) 
  shippingAddress: any; 

  @Field(() => OrderStatus)
  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;


  
  @Field(() => [OrderItem])
  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  items: OrderItem[];


  @Field(() => Payment, { nullable: true })
  @OneToOne(() => Payment, (payment) => payment.order)
  payment: Payment;
}