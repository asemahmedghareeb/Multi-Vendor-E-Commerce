import { ObjectType, Field } from '@nestjs/graphql';
import {
  Entity,
  OneToOne,
  JoinColumn,
  OneToMany,
  Column,
} from 'typeorm';



import { AppBaseEntity } from 'src/modules/core/app-database/entities/app-base.entity';
import { GeneratePermissions } from 'src/common/decorators/generate-entity-permissions.decorator';
import { CartItem } from './cart-item.entity';
import { User } from '../../auth-base/user/entities/user.entity';
import { MoneyScalar } from 'src/common/scalars/money.scalar';

@ObjectType()
@Entity('carts')
@GeneratePermissions()
export class Cart extends AppBaseEntity {
  @Field(() => User)
  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @OneToMany(() => CartItem, (item) => item.cart, { cascade: true })
  items: CartItem[];

  @Field(() => MoneyScalar)
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalAmount: number;
}
