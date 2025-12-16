import { Module } from '@nestjs/common';
import { Follow } from './entities/follow.entity';
import { User } from '../auth-base/user/entities/user.entity';
import { Vendor } from '../vendors/entities/vendor.entity';
import { AppDatabaseModule } from 'src/modules/core/app-database/app-database.module';
import { FollowsService } from './follow.service';
import { FollowsResolver } from './follow.resolver';
import { UserDataloader } from '../auth-base/session/dataloaders/user.dataloader';

@Module({
  imports: [AppDatabaseModule.forFeature([Follow, User, Vendor])],
  providers: [FollowsResolver, FollowsService,UserDataloader],
})
export class FollowModule {}
