import { ObjectType, Field, Float } from '@nestjs/graphql';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Payment } from './payment.entity';
import { AppBaseEntity } from '../../app-database/entities/app-base.entity';
import { GeneratePermissions } from 'src/common/decorators/generate-entity-permissions.decorator';

@ObjectType()
@Entity('refunds')
@GeneratePermissions()
export class Refund extends AppBaseEntity {
  @Field(() => Float)
  @Column({
    type: 'bigint',
    transformer: { to: (v) => v, from: (v) => parseInt(v, 10) },
  })
  amount: number;

  @Field()
  @Column({ nullable: true })
  reason: string;

  @Field()
  @Column({ default: 'succeeded' })
  status: string;

  @Field()
  @Column()
  paymentRefundId: string; //ex stripe refund id

  @Field(() => Payment)
  @ManyToOne(() => Payment, (payment) => payment.refunds)
  @JoinColumn({ name: 'paymentId' })
  payment: Payment;

  @Column()
  paymentId: string;
}