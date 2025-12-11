import { ObjectType, Field, Float, registerEnumType } from '@nestjs/graphql';
import { Entity, Column, ManyToOne, JoinColumn, RelationId } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Wallet } from './wallet.entity';
import { Order } from '../../orders/entities/order.entity';

export enum TransactionType {
  DEPOSIT = 'DEPOSIT',
  SALE = 'SALE',
  COMMISSION = 'COMMISSION',
  PAYOUT = 'PAYOUT',
  REFUND = 'REFUND',
}

registerEnumType(TransactionType, { name: 'TransactionType' });

@ObjectType()
@Entity('wallet_transactions')
export class WalletTransaction extends BaseEntity {
  @Field(() => Float)
  @Column({
    type: 'bigint',
    transformer: { to: (v) => v, from: (v) => parseInt(v, 10) },
  })
  amount: number;

  @Field(() => TransactionType)
  @Column({ type: 'enum', enum: TransactionType })
  type: TransactionType;

  @Field()
  @Column()
  description: string;

  @ManyToOne(() => Wallet, (wallet) => wallet.transactions)
  @JoinColumn({ name: 'wallet_id' })
  wallet: Wallet;

  @RelationId((tx: WalletTransaction) => tx.wallet)
  walletId: string;

  @ManyToOne(() => Order, { nullable: true })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @RelationId((tx: WalletTransaction) => tx.order)
  orderId: string;
}
