import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { WishlistService } from '../services/wishlist.service';
import { Wishlist } from '../entities/wishlist.entity';
import { AddToWishlistInput } from '../dto/inputs/add-to-wishlist.input';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Auth } from 'src/common/decorators/auth.decorator';
import { User } from '../../auth-base/user/entities/user.entity';

@Resolver(() => Wishlist)
export class WishlistResolver {
  constructor(private readonly wishlistService: WishlistService) {}

  @Query(() => Wishlist)
  @Auth()
  async myWishlist(@CurrentUser() user: { userId: string }) {
    return this.wishlistService.getWishlist(user.userId);
  }

  @Mutation(() => Wishlist)
  @Auth()
  async addToWishlist(
    @Args('input') input: AddToWishlistInput,
    @CurrentUser() user: User,
  ) {
    return this.wishlistService.addToWishlist(user, input.productId);
  }

  @Mutation(() => Wishlist)
  @Auth()
  async removeFromWishlist(
    @Args('productId') productId: string,
    @CurrentUser() user: { userId: string },
  ) {
    return this.wishlistService.removeFromWishlist(user.userId, productId);
  }
}
