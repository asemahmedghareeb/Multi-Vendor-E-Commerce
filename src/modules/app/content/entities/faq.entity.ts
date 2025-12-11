import { Field, ObjectType } from '@nestjs/graphql';
import { GeneratePermissions } from 'src/common/decorators/generate-entity-permissions.decorator';
import { AppBaseEntity } from 'src/modules/core/app-database/entities/app-base.entity';
import { Column, Entity, Index } from 'typeorm';
import { FaqForEnum } from '../enums/faq-for.enum';
import { ContentStatusEnum } from '../enums/content-status.enum';

@Entity()
@ObjectType()
@GeneratePermissions()
export class FAQ extends AppBaseEntity {
  @Field()
  @Column()
  @Index()
  code: string;

  @Column({ type: 'text' })
  @Field({ nullable: true })
  enQuestion: string;

  @Column({ type: 'text' })
  @Field({ nullable: true })
  arQuestion: string;

  @Column({ type: 'text' })
  @Field({ nullable: true })
  enAnswer: string;

  @Column({ type: 'text' })
  @Field({ nullable: true })
  arAnswer: string;

  @Column({ type: 'enum', enum: FaqForEnum, default: FaqForEnum.ALL })
  @Field(() => FaqForEnum)
  for: FaqForEnum;

  @Column({
    type: 'enum',
    enum: ContentStatusEnum,
    default: ContentStatusEnum.DRAFT,
  })
  @Field(() => ContentStatusEnum)
  status: ContentStatusEnum;
}
