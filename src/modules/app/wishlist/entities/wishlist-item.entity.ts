import { ObjectType, Field } from '@nestjs/graphql';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Wishlist } from './wishlist.entity';
import { AppBaseEntity } from 'src/modules/core/app-database/entities/app-base.entity';
import { Product } from '../../product/entities/product.entity';
import { GeneratePermissions } from 'src/common/decorators/generate-entity-permissions.decorator';

@ObjectType()
@Entity('wishlist_items')
@GeneratePermissions()
export class WishlistItem extends AppBaseEntity {
  @ManyToOne(() => Wishlist, (wishlist) => wishlist.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'wishlistId' })
  wishlist: Wishlist;

  @Field(() => String)
  @Column()
  wishlistId: string;

  @Field(() => Product)
  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column()
  productId: string;
}
