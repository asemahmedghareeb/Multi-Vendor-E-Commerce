import {
  Resolver,
  Query,
  Mutation,
  Args,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { Wishlist } from './entities/wishlist.entity';
import { WishlistItem } from './entities/wishlist-item.entity';
import { AddToWishlistInput } from './dto/add-to-wishlist.input';
import { Product } from '../products/entities/product.entity';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { ProductLoader } from 'src/dataLoaders/products.loader';

@Resolver(() => Wishlist)
export class WishlistResolver {
  constructor(private readonly wishlistService: WishlistService) {}

  @Query(() => Wishlist)
  @UseGuards(AuthGuard)
  async myWishlist(@CurrentUser() user: { userId: string }) {
    return this.wishlistService.getWishlist(user.userId);
  }

  @Mutation(() => Wishlist)
  @UseGuards(AuthGuard)
  async addToWishlist(
    @Args('input') input: AddToWishlistInput,
    @CurrentUser() user: { userId: string },
  ) {
    return this.wishlistService.addToWishlist(user.userId, input.productId);
  }

  @Mutation(() => Wishlist)
  @UseGuards(AuthGuard)
  async removeFromWishlist(
    @Args('productId') productId: string,
    @CurrentUser() user: { userId: string },
  ) {
    return this.wishlistService.removeFromWishlist(user.userId, productId);
  }
}

@Resolver(() => WishlistItem)
export class WishlistItemResolver {
  constructor(private readonly productLoader: ProductLoader) {}

  @ResolveField(() => Product)
  async product(@Parent() item: WishlistItem) {
    if (item.product) {
      return item.product;
    }

    if (!item.productId) {
      return null;
    }

    return this.productLoader.batchProducts.load(item.productId);
  }
}
