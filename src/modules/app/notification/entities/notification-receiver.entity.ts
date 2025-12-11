import { AppBaseEntity } from 'src/modules/core/app-database/entities/app-base.entity';
import { Column, Entity, Index, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { Notification } from './notification.entity';
import { User } from '../../auth-base/user/entities/user.entity';

@Entity()
@Unique(['receiverUserId', 'notificationId'])
@Index(['receiverUserId', 'notificationId'])
export class NotificationReceiver extends AppBaseEntity {
  @Column({ type: 'timestamp', nullable: true })
  seenAt: Date;

  @Column()
  notificationId: string;

  @ManyToOne(() => Notification, (notification) => notification.receivers, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'notificationId' })
  notification: Notification;

  @Column()
  receiverUserId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'receiverUserId' })
  receiver: User;
}
