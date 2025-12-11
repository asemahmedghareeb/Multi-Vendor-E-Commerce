import { ObjectType, Field, Float } from '@nestjs/graphql';
import {
  Entity,
  OneToOne,
  JoinColumn,
  OneToMany,
  RelationId,
  Column,
} from 'typeorm';



import { AppBaseEntity } from 'src/modules/core/app-database/entities/app-base.entity';
import { GeneratePermissions } from 'src/common/decorators/generate-entity-permissions.decorator';
import { CartItem } from './cart-item.entity';
import { User } from '../../auth-base/user/entities/user.entity';

@ObjectType()
@Entity('carts')
@GeneratePermissions()
export class Cart extends AppBaseEntity {
  @Field(() => User)
  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @RelationId((cart: Cart) => cart.user)
  userId: string;

  @Field(() => [CartItem])
  @OneToMany(() => CartItem, (item) => item.cart, { cascade: true })
  items: CartItem[];

  @Field(() => Float)
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalAmount: number;
}
