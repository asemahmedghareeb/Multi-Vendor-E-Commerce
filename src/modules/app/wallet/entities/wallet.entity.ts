import { ObjectType, Field, Float } from '@nestjs/graphql';
import { Entity, Column, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { WalletTransaction } from './wallet-transaction.entity';
import { AppBaseEntity } from 'src/modules/core/app-database/entities/app-base.entity';
import { User } from '../../auth-base/user/entities/user.entity';
import { GeneratePermissions } from 'src/common/decorators/generate-entity-permissions.decorator';

@ObjectType()
@Entity('wallets')
@GeneratePermissions()
export class Wallet extends AppBaseEntity {
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
