import { ObjectType, Field } from '@nestjs/graphql';
import { Entity, OneToOne, JoinColumn, OneToMany, RelationId } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { WishlistItem } from './wishlist-item.entity';

@ObjectType()
@Entity('wishlists')
export class Wishlist extends BaseEntity {
  @Field(() => User)
  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Field(() => String)
  @RelationId((wishlist: Wishlist) => wishlist.user)
  userId: string;

  @Field(() => [WishlistItem])
  @OneToMany(() => WishlistItem, (item) => item.wishlist, { cascade: true })
  items: WishlistItem[];
}
