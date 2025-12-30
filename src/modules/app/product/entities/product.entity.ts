import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { ObjectType, Field, Int, Float } from '@nestjs/graphql';
import { Vendor } from '../../vendors/entities/vendor.entity';
import { Category } from '../../categories/entities/category.entity';
import { AppBaseEntity } from 'src/modules/core/app-database/entities/app-base.entity';
import { GeneratePermissions } from 'src/common/decorators/generate-entity-permissions.decorator';
import { File } from 'src/modules/core/media/entities/file.entity';
import { MoneyScalar } from 'src/common/scalars/money.scalar';

@ObjectType()
@Entity('products')
@GeneratePermissions()
export class Product extends AppBaseEntity {
  @Field()
  @Column()
  @Index()
  name: string;

  @Field()
  @Column()
  description: string;

  @Field(() => MoneyScalar)
  @Column({
    type: 'bigint',
  })
  price: number;

  @Field(() => Int)
  @Column({ type: 'int', default: 0 })
  inventoryCount: number;

  @OneToMany(() => File, (file) => file.product, {
    cascade: true,
  })
  images?: File[];

  @Field(() => Vendor)
  @ManyToOne(() => Vendor, (vendor) => vendor.products, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'vendorId' })
  vendor: Vendor;

  @Column()
  vendorId: string;

  @Field(() => Category)
  @ManyToOne(() => Category, (category) => category.products)
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @Column()
  categoryId: string;
}
