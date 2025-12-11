import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { AppBaseEntity } from '../../app-database/entities/app-base.entity';
import { PaymentGatewaysEnum } from '../enums/payment-gateways.enum';
import { Field, ObjectType } from '@nestjs/graphql';
import { CardDetailsType } from '../types/card-details.type';
import { User } from 'src/modules/app/auth-base/user/entities/user.entity';

@ObjectType()
@Entity()
export class PaymentMethod extends AppBaseEntity {
  @Column({ type: 'enum', enum: PaymentGatewaysEnum })
  @Field(() => PaymentGatewaysEnum)
  paymentGateway: PaymentGatewaysEnum;

  @Column()
  @Field()
  externalId: string; // pm_xxx (Stripe) | tokenId (MyFatoorah)

  @Column({ default: false })
  @Field()
  isDefault: boolean;

  @Column({
    type: 'json',
    nullable: false,
    default: () => `'{}'`,
  })
  @Field(() => CardDetailsType)
  cardDetails: CardDetailsType;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;
}
