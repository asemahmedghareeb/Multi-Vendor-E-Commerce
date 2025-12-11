import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
  RelationId,
} from 'typeorm';
import { ObjectType, Field, Int, Float } from '@nestjs/graphql';
import { Vendor } from '../../vendors/entities/vendor.entity';
import { Category } from '../../categories/entities/category.entity';
import { AppBaseEntity } from 'src/modules/core/app-database/entities/app-base.entity';

@ObjectType()
@Entity('products')
export class Product extends AppBaseEntity {
  @Field()
  @Column()
  @Index()
  name: string;

  @Field()
  @Column()
  description: string;

  @Field(() => Float)
  @Column({
    type: 'bigint',
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseInt(value, 10),
    },
  })
  price: number;

  @Field(() => Int)
  @Column({ type: 'int', default: 0 })
  inventoryCount: number;

  @Field(() => [String], { nullable: true })
  @Column('text', { array: true, default: [] })
  images: string[];

  @Field(() => Vendor)
  @ManyToOne(() => Vendor, (vendor) => vendor.products)
  @JoinColumn({ name: 'vendorId' })
  vendor: Vendor;

  @RelationId((product: Product) => product.vendor)
  vendorId: string;

  @Field(() => Category)
  @ManyToOne(() => Category, (category) => category.products)
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @RelationId((product: Product) => product.category)
  categoryId: string;
}
