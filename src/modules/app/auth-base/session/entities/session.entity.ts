import { AppBaseEntity } from 'src/modules/core/app-database/entities/app-base.entity';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { DeviceEnum } from 'src/common/enums/device.enum';
import { LangEnum } from 'src/common/enums/lang.enum';
import { AppConfig } from 'src/config/app.config';
import { Field, ObjectType } from '@nestjs/graphql';
import { TimestampScalar } from 'src/common/scalars/timestamp.scalar';

@Entity()
@ObjectType()
export class Session extends AppBaseEntity {
  @Column()
  @Field()
  deviceName: string;

  @Column({ type: 'enum', enum: DeviceEnum })
  @Field(() => DeviceEnum)
  device: DeviceEnum;

  @Column({ nullable: true, unique: true })
  @Index()
  notificationToken?: string;

  @Column({ type: 'timestamp' })
  @Field(() => TimestampScalar)
  accessExpiryDate: Date;

  @Column({ type: 'timestamp' })
  @Field(() => TimestampScalar)
  refreshExpiryDate: Date;

  @Column()
  userId: string;

  @Column({ type: 'enum', enum: LangEnum, nullable: true })
  @Field(() => LangEnum, { nullable: true })
  lang?: LangEnum;

  @Column({ default: false })
  @Field()
  allowNotifications: boolean;

  get expired(): boolean {
    return this.refreshExpiryDate.getTime() <= new Date().getTime();
  }

  @ManyToOne(() => User, (user) => user.sessions, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;
}
