import { Field, ObjectType } from '@nestjs/graphql';
import { PolicyTypeEnum } from '../enums/policy-type.enum';
import { Column, Entity } from 'typeorm';
import { AppBaseEntity } from 'src/modules/core/app-database/entities/app-base.entity';
import { GeneratePermissions } from 'src/common/decorators/generate-entity-permissions.decorator';

@ObjectType()
@GeneratePermissions()
@Entity()
export class Policy extends AppBaseEntity {
  @Field(() => PolicyTypeEnum)
  @Column({
    type: 'enum',
    enum: PolicyTypeEnum,
    unique: true,
  })
  type: PolicyTypeEnum;

  @Field()
  @Column()
  title: string;

  @Field()
  @Column()
  description: string;

  @Field()
  @Column()
  content: string; //html

  @Field({ nullable: true })
  @Column({ nullable: true })
  metaTitle: string; // FOR SEO

  @Field({ nullable: true })
  @Column({ nullable: true })
  metaDescription: string; // FOR SEO

  @Field({ nullable: true })
  @Column({ nullable: true })
  metaKeywords: string; //  Comma-separated keywords for SEO
}
