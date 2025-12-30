import { Review } from './../../reviews/entities/review.entity';
import {
  Entity,
  Column,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { ObjectType, Field, Float, Int } from '@nestjs/graphql';
import { AppBaseEntity } from 'src/modules/core/app-database/entities/app-base.entity';
import { User } from '../../auth-base/user/entities/user.entity';
import { Product } from '../../product/entities/product.entity';
import { OrderItem } from '../../orders/entities/order-item.entity';
import { GeneratePermissions } from 'src/common/decorators/generate-entity-permissions.decorator';
import { VendorPermissionActionsEnum } from '../enums/vendor-permission.enum';
import { VendorStatus } from '../enums/vendor-status.enum';
import { Follow } from '../../follow/entities/follow.entity';


@ObjectType()
@Entity('vendors')
@GeneratePermissions(VendorPermissionActionsEnum)
export class Vendor extends AppBaseEntity {
  @Field()
  @Column()
  businessName: string;

  @Field()
  @Column({ type: 'text' })
  bio: string;

  @Field()
  @Column({ type: 'enum', enum: VendorStatus, default: VendorStatus.PENDING })
  status: VendorStatus;

  @Field(() => Float)
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 10.0 })
  commissionRate: number;

  @Field(() => Float)
  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  averageRating: number;

  @Field(() => Int)
  @Column({ type: 'int', default: 0 })
  reviewsCount: number;


  @Field(() => Int)
  @Column({ type: 'int', default: 0 })
  followersCount: number;

  @Field(() => Int)
  @Column({ type: 'int', default: 0 })
  totalSales: number;

  @Field(() => User)
  @OneToOne(() => User, (user) => user.vendorProfile)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @OneToMany(() => Product, (product) => product.vendor,)
  products: Product[];


  @OneToMany(() => OrderItem, (orderItem) => orderItem.vendor)
  orders: OrderItem[];

  @OneToMany(() => Review, (review) => review.vendor)
  reviews: Review[];

  @OneToMany(() => Follow, (Follow) => Follow.vendor)
  followers: Follow[];
}
