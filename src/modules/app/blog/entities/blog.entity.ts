import { Field, ObjectType } from '@nestjs/graphql';
import { GeneratePermissions } from 'src/common/decorators/generate-entity-permissions.decorator';
import { AppBaseEntity } from 'src/modules/core/app-database/entities/app-base.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { BlogCategory } from './blog-category.entity';
import { User } from '../../auth-base/user/entities/user.entity';
import { BlogStatusEnum } from '../enum/blog-status.enum';
import { BlogMetadata } from './blog-metadata.entity';
import { BlogMedia } from './blog-media.entity';
import { BlogTag } from './blog-tag.entity';
import { TimestampScalar } from 'src/common/scalars/timestamp.scalar';

@Entity()
@ObjectType()
@GeneratePermissions()
export class Blog extends AppBaseEntity {
  @Column()
  @Field()
  enTitle: string;

  @Column()
  @Field()
  arTitle: string;

  @Column({ unique: true })
  @Field()
  slug: string;

  @Column({
    type: 'enum',
    enum: BlogStatusEnum,
    default: BlogStatusEnum.DRAFT,
  })
  @Field(() => BlogStatusEnum)
  status: BlogStatusEnum;

  @Column({ type: 'timestamp' })
  @Field(() => TimestampScalar)
  publishedDate: Date;

  @Column({ type: 'text' })
  @Field()
  arHtmlBody: string;

  @Column({ type: 'text' })
  @Field()
  enHtmlBody: string;

  @Column()
  categoryId: string;

  @ManyToOne(() => BlogCategory, (category) => category.blogs)
  @JoinColumn({
    name: 'categoryId',
  })
  category: BlogCategory;

  @Column()
  authorId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'authorId' })
  author: User;

  @OneToOne(() => BlogMetadata, (blogMetadata) => blogMetadata.blog)
  blogMetadata: BlogMetadata;

  @OneToMany(() => BlogMedia, (blogMedia) => blogMedia.blog)
  blogMedia: BlogMedia[];

  @OneToMany(() => BlogTag, (blogTag) => blogTag.blog)
  blogTags: BlogTag[];
}
