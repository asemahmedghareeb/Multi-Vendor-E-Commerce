import { Field, ObjectType } from '@nestjs/graphql';
import { AppBaseEntity } from 'src/modules/core/app-database/entities/app-base.entity';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { Blog } from './blog.entity';

@Entity()
@ObjectType()
export class BlogMetadata extends AppBaseEntity {
  @Column({ nullable: true })
  @Field({ nullable: true })
  metaTitle: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  metaDescription: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  metaKeywords: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  canonicalUrl: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  ogTitle: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  ogDescription: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  ogImageUrl: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  twitterCardType: string;

  @Column()
  blogId: string;

  @OneToOne(() => Blog, (blog) => blog.blogMetadata)
  @JoinColumn({
    name: 'blogId',
  })
  blog: Blog;
}
