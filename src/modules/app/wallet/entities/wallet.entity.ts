import { ObjectType, Field } from '@nestjs/graphql';
import { Entity, Column, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { WalletTransaction } from './wallet-transaction.entity';
import { AppBaseEntity } from 'src/modules/core/app-database/entities/app-base.entity';
import { User } from '../../auth-base/user/entities/user.entity';
import { GeneratePermissions } from 'src/common/decorators/generate-entity-permissions.decorator';
import { MoneyScalar } from 'src/common/scalars/money.scalar';

@ObjectType()
@Entity('wallets')
@GeneratePermissions()
export class Wallet extends AppBaseEntity {
  @Field(() => MoneyScalar)
  @Column({
    type: 'bigint',
    default: 0,
  })
  balance: number;

  @OneToOne(() => User, (user) => user.wallet)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Field(() => String)
  @Column()
  userId: string;

  @OneToMany(
    () => WalletTransaction,
    (walletTransaction) => walletTransaction.wallet,
  )
  transactions: WalletTransaction[];
}
