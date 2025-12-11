import { AppBaseEntity } from 'src/modules/core/app-database/entities/app-base.entity';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { VerificationCodeUseCaseEnum } from '../enums/verification-code-use-case.enum';
import { User } from './user.entity';
import { VerificationCodeMetadata } from '../types/verification-code-metadata.type';

@Entity()
export class UserVerificationCode extends AppBaseEntity {
  @Column({
    type: 'enum',
    enum: VerificationCodeUseCaseEnum,
  })
  useCase: VerificationCodeUseCaseEnum;

  @Column({ type: 'varchar', length: 6 })
  code: string;

  @Column({ type: 'timestamp' })
  expiryDate: Date;

  @Column()
  userId: string;

  @Column({
    type: 'json',
    nullable: false,
    default: () => `'{}'`,
  })
  metadata: VerificationCodeMetadata;

  @OneToOne(() => User, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;
}
