import {
  Resolver,
  Mutation,
  Query,
  Args,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { Follow } from './entities/follow.entity';
import { FollowsService } from './follow.service';
import { VendorLoader } from 'src/dataLoaders/vendor.loader';
import { UserLoader } from 'src/dataLoaders/user.loader';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Vendor } from 'src/vendors/entities/vendor.entity';
import { User } from 'src/users/entities/user.entity';

@Resolver(() => Follow)
export class FollowsResolver {
  constructor(
    private readonly followsService: FollowsService,
    private readonly vendorLoader: VendorLoader,
    private readonly userLoader: UserLoader,
  ) {}

  @Mutation(() => Boolean)
  @UseGuards(AuthGuard)
  async followVendor(
    @Args('vendorId') vendorId: string,
    @CurrentUser() user: { userId: string },
  ) {
    return this.followsService.follow(user.userId, vendorId);
  }

  @Mutation(() => Boolean)
  @UseGuards(AuthGuard)
  async unfollowVendor(
    @Args('vendorId') vendorId: string,
    @CurrentUser() user: { userId: string },
  ) {
    return this.followsService.unfollow(user.userId, vendorId);
  }

  @Query(() => [Follow], { name: 'myFollows' })
  @UseGuards(AuthGuard)
  async myFollows(@CurrentUser() user: { userId: string }) {
    return this.followsService.getMyFollows(user.userId);
  }

  @ResolveField(() => Vendor)
  async vendor(@Parent() follow: Follow) {
    return this.vendorLoader.batchVendors.load(follow.vendorId);
  }

  @ResolveField(() => User)
  async follower(@Parent() follow: Follow) {
    return this.userLoader.batchUsers.load(follow.followerId);
  }
}
