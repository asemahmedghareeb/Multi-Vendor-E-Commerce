import { AuthGuard } from 'src/auth/guards/auth.guard';
import {
  Resolver,
  Mutation,
  Query,
  Args,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { Review } from './entities/review.entity';
import { CreateReviewInput } from './dto/create-review.input';
import { UserLoader } from 'src/dataLoaders/user.loader';
import { VendorLoader } from 'src/dataLoaders/vendor.loader';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { User } from 'src/users/entities/user.entity';
import { Vendor } from 'src/vendors/entities/vendor.entity';
import { UpdateReviewInput } from './dto/update-review.input';
import { genericPaginated } from 'src/common/dto/paginated-output';
import { PaginationInput } from 'src/common/dto/pagination.input';

const paginatedReviews = genericPaginated(Review);
@Resolver(() => Review)
export class ReviewsResolver {
  constructor(
    private readonly reviewsService: ReviewsService,
    private readonly userLoader: UserLoader,
    private readonly vendorLoader: VendorLoader,
  ) {}

  @Mutation(() => Review)
  @UseGuards(AuthGuard)
  async createReview(
    @Args('input') input: CreateReviewInput,
    @CurrentUser() user: { userId: string },
  ) {
    return this.reviewsService.create(user.userId, input);
  }

  @Query(() => paginatedReviews)
  async vendorReviews(
    @Args('vendorId') vendorId: string,
    @Args('pagination', { nullable: true }) pagination?: PaginationInput,
  ) {
      const input = pagination || { page: 1, limit: 10 };
    return this.reviewsService.findByVendor(vendorId, input);
  }

  @Mutation(() => Review)
  @UseGuards(AuthGuard)
  async updateReview(
    @Args('input') input: UpdateReviewInput,
    @CurrentUser() user: { userId: string; role: string },
  ) {
    return this.reviewsService.update(user.userId, input);
  }

  @Mutation(() => Boolean)
  @UseGuards(AuthGuard)
  async removeReview(
    @Args('id') id: string,
    @CurrentUser() user: { userId: string },
  ) {
    return this.reviewsService.remove(user.userId, id);
  }

  @ResolveField(() => User)
  async user(@Parent() review: Review) {
    return this.userLoader.batchUsers.load(review.userId);
  }

  @ResolveField(() => Vendor)
  async vendor(@Parent() review: Review) {
    return this.vendorLoader.batchVendors.load(review.vendorId);
  }
}
