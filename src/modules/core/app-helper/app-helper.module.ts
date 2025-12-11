import { Global, Module } from '@nestjs/common';
import { AppHelperService } from './services/app-helper.service';
import { AuthHelperService } from './services/auth-helper.service';
import { GuardHelperService } from './services/guard-helper.service';
import { AppDatabaseModule } from '../app-database/app-database.module';
import { AdminGroup } from 'src/modules/app/auth-base/admin-group/entities/admin-group.entity';
import { ContextModule } from '../context/context.module';

@Global()
@Module({
  imports: [AppDatabaseModule.forFeature([AdminGroup]), ContextModule],
  providers: [AppHelperService, AuthHelperService, GuardHelperService],
  exports: [AppHelperService, AuthHelperService, GuardHelperService],
})
export class AppHelperModule {}
