import {
  Resolver,
  Mutation,
  Args,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { CreateReviewInput } from '../dto/inputs/create-review.input';
import { Review } from '../entities/review.entity';
import { Auth } from 'src/common/decorators/auth.decorator';
import { User } from '../../auth-base/user/entities/user.entity';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { ReviewsService } from '../services/reviews.service';
import { UpdateReviewInput } from '../dto/inputs/update-review.input';

@Resolver(() => Review)
export class ReviewsResolver {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Mutation(() => Review)
  @Auth()
  async createReview(
    @Args('input') input: CreateReviewInput,
    @CurrentUser() user: User,
  ) {
    return this.reviewsService.create(user.id, input);
  }

  @Mutation(() => Review)
  @Auth()
  async updateReview(
    @Args('input') input: UpdateReviewInput,
    @CurrentUser() user: { userId: string; role: string },
  ) {
    return this.reviewsService.update(user.userId, input);
  }

  @Mutation(() => Boolean)
  @Auth()
  async removeReview(
    @Args('id') id: string,
    @CurrentUser() user: { userId: string },
  ) {
    return this.reviewsService.remove(user.userId, id);
  }
}
