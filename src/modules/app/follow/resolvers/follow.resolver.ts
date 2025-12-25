import {
  Resolver,
  Mutation,
  Query,
  Args,
  // ResolveField,
  // Parent,
} from '@nestjs/graphql';
import { Follow } from '../entities/follow.entity';
import { FollowsService } from '../services/follow.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { User } from '../../auth-base/user/entities/user.entity';
import { Auth } from 'src/common/decorators/auth.decorator';
import {
  NullablePaginatorArgsInput,
} from 'src/common/dtos/inputs/paginator.input';
import { UserRoleEnum } from 'src/common/enums/user-role.enum';
import { FollowersPaginated } from '../dto/paginated-follow.type';
// import { UserDataloader } from '../auth-base/session/dataloaders/user.dataloader';

@Resolver(() => Follow)
export class FollowsResolver {
  constructor(
    private readonly followsService: FollowsService,
    // private readonly userDataloader: UserDataloader,
  ) {}

  @Auth()
  @Mutation(() => Boolean)
  async followVendor(
    @Args('vendorId') vendorId: string,
    @CurrentUser() user: User,
  ) {
    return this.followsService.follow(user.id, vendorId);
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
  @Query(() => FollowersPaginated)
  async myFollowers(
    @Args({ nullable: true }) pagination: NullablePaginatorArgsInput,
    @CurrentUser() user: User,
  ) {
    return this.followsService.getMyFollowers(user, pagination.paginate);
  }

  // @ResolveField(() => User)
  // async follower(@Parent() follow: Follow) {
  //   return this.userDataloader.getDataloader().load(follow.followerId);
  // }
}
