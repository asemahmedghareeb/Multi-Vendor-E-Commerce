import { Field } from '@nestjs/graphql';
import { Column, Entity } from 'typeorm';
import { PaymentGatewaysEnum } from '../enums/payment-gateways.enum';
import { AppBaseEntity } from '../../../core/app-database/entities/app-base.entity';
import { SubscriptionStatusEnum } from '../enums/subscription-status.enum';
import { TimestampScalar } from 'src/common/scalars/timestamp.scalar';

@Entity()
export class Subscription extends AppBaseEntity {
  @Column()
  @Field(() => PaymentGatewaysEnum)
  provider: PaymentGatewaysEnum;

  //@Column()
  //planId: string;

  @Column({ type: 'enum', enum: SubscriptionStatusEnum })
  @Field(() => SubscriptionStatusEnum)
  subscriptionStatus: SubscriptionStatusEnum;

  @Column({ type: 'timestamp', nullable: true })
  @Field(() => TimestampScalar)
  currentPeriodStart: Date;

  @Column({ type: 'timestamp', nullable: true })
  @Field(() => TimestampScalar)
  currentPeriodEnd: Date;
}
