import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { AppBaseEntity } from '../../app-database/entities/app-base.entity';
import { Field, ObjectType } from '@nestjs/graphql';
import { Session } from 'src/modules/app/auth-base/session/entities/session.entity';
import { GeneratePermissions } from 'src/common/decorators/generate-entity-permissions.decorator';
@Entity()
@ObjectType()
@GeneratePermissions()
export class UserActivity extends AppBaseEntity {
  @Column()
  @Field()
  mutationName: string;

  @Column()
  @Field()
  success: boolean;

  @Column({ nullable: true })
  @Field({ nullable: true })
  code: number;

  @Column()
  @Field()
  executionTime: number;

  @Column({ nullable: true, type: 'text' })
  @Field(() => String, { nullable: true })
  ip?: string | null;

  @Column({
    nullable: true,
  })
  sessionId: string;

  @ManyToOne(() => Session)
  @JoinColumn({
    name: 'sessionId',
  })
  session: Session;
}
