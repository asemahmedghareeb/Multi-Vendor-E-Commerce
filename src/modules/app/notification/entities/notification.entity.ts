import { Field, ObjectType } from '@nestjs/graphql';
import { GeneratePermissions } from 'src/common/decorators/generate-entity-permissions.decorator';
import { AppBaseEntity } from 'src/modules/core/app-database/entities/app-base.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { NotificationMetadataType } from '../types/notification-metadata.type';
import { NotificationReceiver } from './notification-receiver.entity';
import { User } from '../../auth-base/user/entities/user.entity';
import { TimestampScalar } from 'src/common/scalars/timestamp.scalar';

@Entity()
@ObjectType()
@GeneratePermissions()
export class Notification extends AppBaseEntity {
  @Field()
  @Column()
  enTitle: string;

  // not column in the db
  @Field(() => TimestampScalar, { nullable: true })
  seenAt: Date;

  @Field()
  @Column()
  arTitle: string;

  @Field()
  @Column()
  enBody: string;

  @Field()
  @Column()
  arBody: string;

  @Field(() => NotificationMetadataType)
  @Column({ type: 'json', nullable: true })
  metadata?: NotificationMetadataType;

  @OneToMany(
    () => NotificationReceiver,
    (userNotification) => userNotification.notification,
  )
  receivers: NotificationReceiver[];

  @Column({ nullable: true })
  sentByUserId?: string;

  @Field(() => TimestampScalar)
  @ManyToOne(() => User)
  @JoinColumn({ name: 'sentByUserId' })
  sentBy: User;
}
