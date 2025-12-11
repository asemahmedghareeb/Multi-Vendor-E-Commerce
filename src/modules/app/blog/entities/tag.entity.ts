import { Field, ObjectType } from '@nestjs/graphql';
import { GeneratePermissions } from 'src/common/decorators/generate-entity-permissions.decorator';
import { AppBaseEntity } from 'src/modules/core/app-database/entities/app-base.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { BlogTag } from './blog-tag.entity';

@Entity()
@ObjectType()
@GeneratePermissions()
export class Tag extends AppBaseEntity {
  @Column()
  @Field()
  arName: string;

  @Column()
  @Field()
  enName: string;

  @Column()
  @Field()
  slug: string;

  @OneToMany(() => BlogTag, (blogTag) => blogTag.tag)
  blogTags: BlogTag[];
}
