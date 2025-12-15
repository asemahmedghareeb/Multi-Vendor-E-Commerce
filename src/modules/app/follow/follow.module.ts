import { Module } from '@nestjs/common';
import { Follow } from './entities/follow.entity';
import { User } from '../auth-base/user/entities/user.entity';
import { Vendor } from '../vendors/entities/vendor.entity';
import { AppDatabaseModule } from 'src/modules/core/app-database/app-database.module';

@Module({
  imports: [AppDatabaseModule.forFeature([Follow, User, Vendor])],
  // providers: [FollowsResolver, FollowsService],
})
export class FollowModule {}
