import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  RelationId
} from 'typeorm';
import { ObjectType, Field, Int, Parent } from '@nestjs/graphql';

import { AppBaseEntity } from 'src/modules/core/app-database/entities/app-base.entity';
import { Product } from '../../product/entities/product.entity';

@ObjectType()
@Entity('categories')
export class Category extends AppBaseEntity {
  @Field()
  @Column()
  name: string;

  @Field(() => Category, { nullable: true })
  @ManyToOne(() => Category, (category) => category.children, {
    nullable: true,
  })
  @JoinColumn({ name: 'parentId' })
  parent: Category;

  @RelationId((category: Category) => category.parent)
  parentId: string;

  @Field(() => [Category], { nullable: true })
  @OneToMany(() => Category, (category) => category.parent)
  children: Category[];

  @OneToMany(() => Product, (product) => product.category)
  products: Product[];
}
