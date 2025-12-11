import { Global, Module } from '@nestjs/common';
import { ContextService } from './context.service';
import { SessionModule } from 'src/modules/app/auth-base/session/session.module';
import { AppDatabaseModule } from '../app-database/app-database.module';
import { Session } from 'src/modules/app/auth-base/session/entities/session.entity';

@Module({
  imports: [SessionModule, AppDatabaseModule.forFeature([Session])],
  providers: [ContextService],
  exports: [ContextService],
})
export class ContextModule {
  constructor() {}
}
