import { ObjectType } from '@nestjs/graphql';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../auth-base/user/entities/user.entity';
import { ChannelMemberTypeEnum } from '../enums/channel-member-type.enum';

@Entity()
@ObjectType()
export class ChannelMember {
  @PrimaryGeneratedColumn()
  uid: number;

  createdAt: string;

  @Column({ type: 'enum', enum: ChannelMemberTypeEnum })
  type: ChannelMemberTypeEnum;

  @Column()
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;
}
