import { ObjectType, Field, Float } from '@nestjs/graphql';
import { Entity, Column, ManyToOne, OneToMany, JoinColumn, OneToOne } from 'typeorm';
import { OrderItem } from './order-item.entity';

import { OrderStatus } from '../enum/order-status.enum';
import { AppBaseEntity } from 'src/modules/core/app-database/entities/app-base.entity';
import { User } from '../../auth-base/user/entities/user.entity';
import { Payment } from '../../payments/entities/payment.entity';
import { GeneratePermissions } from 'src/common/decorators/generate-entity-permissions.decorator';


@ObjectType()
@Entity('orders')
@GeneratePermissions()
export class Order extends AppBaseEntity {

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