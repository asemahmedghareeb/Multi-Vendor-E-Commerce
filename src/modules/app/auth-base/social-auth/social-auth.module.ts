import { Module } from '@nestjs/common';
import { SocialAuthResolver } from './resolvers/social-auth.resolver';
import { SocialAuthService } from './services/social-auth.service';
import { SocialProviderService } from './services/social-provider.service';
import { AppDatabaseModule } from 'src/modules/core/app-database/app-database.module';
import { SocialAccount } from './entities/social-account.entity';
import { GoogleStrategy } from './strategies/google.strategy';
import { FacebookStrategy } from './strategies/facebook.strategy';
import { User } from '../user/entities/user.entity';
// import { AppleStrategy } from './strategies/apple.strategy';

@Module({
  imports: [AppDatabaseModule.forFeature([SocialAccount, User])],
  providers: [
    SocialAuthResolver,
    SocialAuthService,
    SocialProviderService,
    GoogleStrategy,
    FacebookStrategy,
    // AppleStrategy,
  ],
  exports: [SocialAuthService],
})
export class SocialAuthModule {}
