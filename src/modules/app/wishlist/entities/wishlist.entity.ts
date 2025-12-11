import { ObjectType, Field } from '@nestjs/graphql';
import { Entity, OneToOne, JoinColumn, OneToMany, RelationId } from 'typeorm';
import { WishlistItem } from './wishlist-item.entity';
import { AppBaseEntity } from 'src/modules/core/app-database/entities/app-base.entity';
import { User } from '../../auth-base/user/entities/user.entity';

@ObjectType()
@Entity('wishlists')
export class Wishlist extends AppBaseEntity {
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
