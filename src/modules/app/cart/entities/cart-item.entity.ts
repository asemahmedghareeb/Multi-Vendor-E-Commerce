import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Entity, Column, ManyToOne, JoinColumn, RelationId } from 'typeorm';

import { Cart } from './cart.entity';
import { AppBaseEntity } from 'src/modules/core/app-database/entities/app-base.entity';
import { GeneratePermissions } from 'src/common/decorators/generate-entity-permissions.decorator';
import { Product } from '../../product/entities/product.entity';

@ObjectType()
@Entity('cart_items')
@GeneratePermissions()
export class CartItem extends AppBaseEntity {
  @Field(() => Int)
  @Column({ type: 'int', default: 1 })
  quantity: number;

  @ManyToOne(() => Cart, (cart) => cart.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cart_id' })
  cart: Cart;

  @RelationId((item: CartItem) => item.cart)
  cartId: string;

  @Field(() => Product)
  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Field()
  @RelationId((item: CartItem) => item.product)
  productId: string;
}
