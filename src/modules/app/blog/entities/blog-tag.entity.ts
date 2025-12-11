import { ObjectType } from '@nestjs/graphql';
import { AppBaseEntity } from 'src/modules/core/app-database/entities/app-base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Blog } from './blog.entity';
import { Tag } from './tag.entity';

@Entity()
@ObjectType()
export class BlogTag extends AppBaseEntity {
  @Column()
  blogId: string;

  @ManyToOne(() => Blog, (blog) => blog.blogTags)
  @JoinColumn({
    name: 'blogId',
  })
  blog: Blog;

  @Column()
  tagId: string;

  @ManyToOne(() => Tag, (tag) => tag.blogTags)
  @JoinColumn({
    name: 'tagId',
  })
  tag: Tag;
}
