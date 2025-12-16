import {
  Resolver,
  Mutation,
  Query,
  Args,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { Follow } from './entities/follow.entity';
import { FollowsService } from './follow.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { User } from '../auth-base/user/entities/user.entity';
import { Auth } from 'src/common/decorators/auth.decorator';
import { PaginatorInput } from 'src/common/dtos/inputs/paginator.input';
import { UserRoleEnum } from 'src/common/enums/user-role.enum';
import { UserDataloader } from '../auth-base/session/dataloaders/user.dataloader';

@Resolver(() => Follow)
export class FollowsResolver {
  constructor(
    private readonly followsService: FollowsService,
    private readonly userDataloader: UserDataloader,
  ) {}

  @Auth()
  @Mutation(() => Boolean)
  async followVendor(
    @Args('vendorId') vendorId: string,
    @CurrentUser() user: { userId: string },
  ) {
    return this.followsService.follow(user.userId, vendorId);
  }

  @Auth()
  @Mutation(() => Boolean)
  async unfollowVendor(
    @Args('vendorId') vendorId: string,
    @CurrentUser() user: User,
  ) {
    return this.followsService.unfollow(user.id, vendorId);
  }

  @Auth({
    roles: [UserRoleEnum.VENDOR],
  })
  @Query(() => [Follow])
  async myFollowers(
    @Args('pagination') pagination: PaginatorInput,
    @CurrentUser() user: User,
  ) {
    return this.followsService.getMyFollowers(user, pagination);
  }

    // @ResolveField(() => User)
    // async follower(@Parent() follow: Follow) {
    //   return this.userDataloader.getDataloader().load(follow.followerId);
    // }
}
