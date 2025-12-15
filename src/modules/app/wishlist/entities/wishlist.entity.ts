import { ObjectType, Field } from '@nestjs/graphql';
import { Entity, OneToOne, JoinColumn, OneToMany, Column } from 'typeorm';
import { WishlistItem } from './wishlist-item.entity';
import { AppBaseEntity } from 'src/modules/core/app-database/entities/app-base.entity';
import { User } from '../../auth-base/user/entities/user.entity';
import { GeneratePermissions } from 'src/common/decorators/generate-entity-permissions.decorator';

@ObjectType()
@Entity('wishlists')
@GeneratePermissions()
export class Wishlist extends AppBaseEntity {
  @Field(() => User)
  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Field(() => String)
  @Column()
  userId: string;

  @Field(() => [WishlistItem])
  @OneToMany(() => WishlistItem, (item) => item.wishlist, { cascade: true })
  items: WishlistItem[];
}
