import { Module } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { AuthResolver } from './resolvers/auth.resolver';
import { UserModule } from '../user/user.module';
import { AppDatabaseModule } from 'src/modules/core/app-database/app-database.module';
import { User } from '../user/entities/user.entity';
import { SessionModule } from '../session/session.module';
import { Session } from '../session/entities/session.entity';
import { SocialAuthModule } from '../social-auth/social-auth.module';

@Module({
  imports: [
    UserModule,
    SessionModule,
    SocialAuthModule,
    AppDatabaseModule.forFeature([User, Session]),
  ],
  providers: [AuthService, AuthResolver],
  exports: [],
})
export class AuthModule {}
