import { Field, ObjectType } from '@nestjs/graphql';
import { AppConfig } from 'src/config/app.config';
import { AppBaseEntity } from 'src/modules/core/app-database/entities/app-base.entity';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { UserRoleEnum } from 'src/common/enums/user-role.enum';
import { LangEnum } from 'src/common/enums/lang.enum';
import { UserVerificationCode } from './user-verification-code.entity';
import { Session } from '../../session/entities/session.entity';
import { SocialAccount } from '../../social-auth/entities/social-account.entity';
import { AppJwtToken } from 'src/common/types/app-jwt-token.type';
import { AdminGroup } from '../../admin-group/entities/admin-group.entity';
import { GeneratePermissions } from 'src/common/decorators/generate-entity-permissions.decorator';

@Entity()
@ObjectType()
@GeneratePermissions()
export class User extends AppBaseEntity {
  @Column({ nullable: true })
  @Field({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  lastName: string;

  @Column({ default: AppConfig.defaultLang })
  @Field(() => LangEnum)
  favLang: LangEnum;

  @Index()
  @Column({
    type: 'varchar',
    nullable: true,
    transformer: {
      from: (value: string | null): string | null => {
        return value;
      },
      to: (value: string | null): string | null => {
        if (!value) {
          return value;
        }
        return value.toLowerCase();
      },
    },
  })
  @Field(() => String, { nullable: true })
  email?: string | null;

  @Column({ default: false })
  @Field(() => Boolean)
  isVerifiedEmail: boolean = false;

  @Column({ type: 'varchar', nullable: true })
  @Index()
  @Field(() => String, { nullable: true })
  phoneNumber?: string | null;

  @Column({ default: false })
  @Field(() => Boolean)
  isVerifiedPhoneNumber: boolean = false;

  @Field(() => Boolean)
  get isVerified(): boolean {
    return this.isVerifiedEmail || this.isVerifiedPhoneNumber;
  }

  @Field(() => Boolean)
  get hasPassword(): boolean {
    return !!this.password;
  }

  @Column({ nullable: true })
  password: string;

  @Column({ unique: true })
  @Index()
  @Field({ nullable: true })
  code: string;

  @Column({ default: false })
  @Field(() => Boolean)
  isBlocked: boolean = false;

  @Column({ type: 'enum', enum: UserRoleEnum })
  @Field()
  role: UserRoleEnum;

  @Field(() => AppJwtToken, { nullable: true })
  jwtAutToken?: AppJwtToken;

  @Column({ nullable: false, default: false })
  @Field()
  requireSettingPassword: boolean;

  @Column({ nullable: false, default: false })
  @Field()
  requireCompleteProfileInfo: boolean;

  @OneToOne(
    () => UserVerificationCode,
    (userVerificationCode) => userVerificationCode.user,
  )
  userVerificationCode: UserVerificationCode[];

  @OneToMany(() => Session, (session) => session.user)
  sessions: Session[];

  @OneToMany(() => SocialAccount, (socialAccount) => socialAccount.user)
  socialAccounts: SocialAccount[];

  @Column({ nullable: true })
  adminGroupId: string;

  @ManyToOne(() => AdminGroup, (adminGroup) => adminGroup.users, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'adminGroupId' })
  adminGroup: AdminGroup;
}
