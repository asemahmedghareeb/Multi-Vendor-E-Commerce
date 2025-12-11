import { Field, ObjectType } from '@nestjs/graphql';
import { AppBaseEntity } from 'src/modules/core/app-database/entities/app-base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BlogMediaTypeEnum } from '../enum/blog-media-type.enum';
import { Blog } from './blog.entity';
import { File } from 'src/modules/core/media/entities/file.entity';

@Entity()
@ObjectType()
export class BlogMedia extends AppBaseEntity {
  @Column()
  @Field()
  altText: string;

  @Column()
  @Field()
  caption: string;

  @Column()
  @Field(() => BlogMediaTypeEnum)
  type: BlogMediaTypeEnum;

  @Column()
  blogId: string;

  @ManyToOne(() => Blog, (blog) => blog.blogMedia)
  @JoinColumn({
    name: 'blogId',
  })
  blog: Blog;

  @Column({ nullable: true })
  fileId: string;

  @ManyToOne(() => File)
  @JoinColumn({
    name: 'fileId',
  })
  file: File;
}
 