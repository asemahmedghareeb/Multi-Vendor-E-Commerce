import { Field, ObjectType } from '@nestjs/graphql';
import { AppBaseEntity } from 'src/modules/core/app-database/entities/app-base.entity';
import { Column, Entity } from 'typeorm';

@Entity()
@ObjectType()
export class SlugRedirects extends AppBaseEntity {
  @Column()
  @Field()
  oldSlug: string;

  @Column()
  @Field()
  newSlug: string;
}
