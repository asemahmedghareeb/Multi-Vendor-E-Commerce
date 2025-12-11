import { Field, ObjectType } from '@nestjs/graphql';
import { GeneratePermissions } from 'src/common/decorators/generate-entity-permissions.decorator';
import { AppBaseEntity } from 'src/modules/core/app-database/entities/app-base.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { Blog } from './blog.entity';

@Entity()
@ObjectType()
@GeneratePermissions()
export class BlogCategory extends AppBaseEntity {
  @Column({ unique: true })
  @Field()
  slug: string;

  @Column()
  @Field()
  enName: string;

  @Column()
  @Field()
  arName: string;

  @Field(() => String)
  get isParent() {
    return !this.parentId;
  }

  @Column({ nullable: true })
  parentId: string;

  @ManyToOne(() => BlogCategory)
  @JoinColumn({
    name: 'parentId',
  })
  parent: BlogCategory;

  @OneToMany(() => Blog, (blog) => blog.category)
  blogs: Blog[];
}
