import { ObjectType, Field, Float } from '@nestjs/graphql';
import { Entity, Column, ManyToOne, JoinColumn, RelationId } from 'typeorm';
import { Payment } from './payment.entity';
import { AppBaseEntity } from 'src/modules/core/app-database/entities/app-base.entity';
import { GeneratePermissions } from 'src/common/decorators/generate-entity-permissions.decorator';

@ObjectType()
@Entity('refunds')
@GeneratePermissions()
export class Refund extends AppBaseEntity {
  
  @Field(() => Float)
  @Column({ 
    type: 'bigint', 
    transformer: { to: (v) => v, from: (v) => parseInt(v, 10) } 
  })
  amount: number;

  @Field()
  @Column({ nullable: true })
  reason: string;

  @Field()
  @Column({ default: 'succeeded' })
  status: string;

  // --- STRIPE DATA ---
  @Field()
  @Column({ name: 'stripe_refund_id' })
  stripeRefundId: string;

  // --- RELATION ---
  @Field(() => Payment)
  @ManyToOne(() => Payment, (payment) => payment.refunds)
  @JoinColumn({ name: 'payment_id' })
  payment: Payment;

  @RelationId((refund: Refund) => refund.payment)
  paymentId: string;
}