import { ObjectType, Field } from '@nestjs/graphql';
import { Entity, Column, ManyToOne, JoinColumn, RelationId } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Product } from '../../products/entities/product.entity';
import { Wishlist } from './wishlist.entity';

@ObjectType()
@Entity('wishlist_items')
export class WishlistItem extends BaseEntity {
  @ManyToOne(() => Wishlist, (wishlist) => wishlist.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'wishlist_id' })
  wishlist: Wishlist;

  @Field(() => String)
  @RelationId((wishlistItem: WishlistItem) => wishlistItem.wishlist)
  wishlistId: string;

  @Field(() => Product)
  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Field(() => String)
  @RelationId((wishlistItem: WishlistItem) => wishlistItem.product)
  productId: string;
}
