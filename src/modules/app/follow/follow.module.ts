import { Module } from '@nestjs/common';
import { FollowsResolver } from './follow.resolver';
import { FollowsService } from './follow.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Follow } from './entities/follow.entity';
import { User } from 'src/users/entities/user.entity';
import { Vendor } from 'src/vendors/entities/vendor.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Follow, User, Vendor])],
  providers: [FollowsResolver, FollowsService],
})
export class FollowModule {}
