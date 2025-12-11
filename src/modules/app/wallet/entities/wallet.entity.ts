import { ObjectType, Field, Float } from '@nestjs/graphql';
import { Entity, Column, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { WalletTransaction } from './wallet-transaction.entity';

@ObjectType()
@Entity('wallets')
export class Wallet extends BaseEntity {
  @Field(() => Float)
  @Column({
    type: 'bigint',
    default: 0,
    transformer: { to: (v) => v, from: (v) => parseInt(v, 10) },
  })
  balance: number;

  @OneToOne(() => User, (user) => user.wallet)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(
    () => WalletTransaction,
    (walletTransaction) => walletTransaction.wallet,
  )
  transactions: WalletTransaction[];
}
