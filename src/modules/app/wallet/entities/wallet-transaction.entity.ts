import { ObjectType, Field, Float } from '@nestjs/graphql';
import { Entity, Column, ManyToOne, JoinColumn, RelationId } from 'typeorm';
import { Order } from '../../orders/entities/order.entity';
import { AppBaseEntity } from 'src/modules/core/app-database/entities/app-base.entity';
import { GeneratePermissions } from 'src/common/decorators/generate-entity-permissions.decorator';
import { Wallet } from './wallet.entity';
import { TransactionType } from '../enums/transactions.enum';
import { MoneyScalar } from 'src/common/scalars/money.scalar';

@ObjectType()
@Entity('wallet_transactions')
@GeneratePermissions()
export class WalletTransaction extends AppBaseEntity {
  @Field(() => MoneyScalar)
  @Column({
    type: 'bigint',
  })
  amount: number;

  @Field(() => TransactionType)
  @Column({ type: 'enum', enum: TransactionType })
  type: TransactionType;

  @Field()
  @Column()
  description: string;

  @ManyToOne(() => Wallet, (wallet) => wallet.transactions)
  @JoinColumn({ name: 'walletId' })
  wallet: Wallet;

  @RelationId((tx: WalletTransaction) => tx.wallet)
  walletId: string;

  @ManyToOne(() => Order, { nullable: true })
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @RelationId((tx: WalletTransaction) => tx.order)
  orderId: string;
}
