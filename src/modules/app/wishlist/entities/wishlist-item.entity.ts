import { ObjectType, Field } from '@nestjs/graphql';
import { Entity, Column, ManyToOne, JoinColumn, RelationId } from 'typeorm';
import { Wishlist } from './wishlist.entity';
import { AppBaseEntity } from 'src/modules/core/app-database/entities/app-base.entity';
import { Product } from '../../product/entities/product.entity';

@ObjectType()
@Entity('wishlist_items')
export class WishlistItem extends AppBaseEntity {
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
