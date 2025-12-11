import { Field, ObjectType } from '@nestjs/graphql';
import { GeneratePermissions } from 'src/common/decorators/generate-entity-permissions.decorator';
import { AppBaseEntity } from 'src/modules/core/app-database/entities/app-base.entity';
import { Column, Entity } from 'typeorm';
import { AppContactsEnum } from '../enums/app-contacts.enum';

@Entity()
@ObjectType()
@GeneratePermissions()
export class AppContact extends AppBaseEntity {
  @Field(() => AppContactsEnum)
  @Column({
    type: 'enum',
    unique: true,
    enum: AppContactsEnum,
  })
  type: AppContactsEnum;

  @Field()
  @Column()
  target: string;
}
