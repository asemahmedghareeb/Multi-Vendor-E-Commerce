import {
  Resolver,
  Query,
  Mutation,
  Args,
  ResolveField,
  Parent,
} from '@nestjs/graphql';

import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Auth } from 'src/common/decorators/auth.decorator';
import { Cart } from '../entities/cart.entity';
import { CartItem } from '../entities/cart-item.entity';
import { AddToCartInput } from '../dto/inputs/add-to-cart.input';
import { UpdateCartItemInput } from '../dto/inputs/update-cart-item-input';
import { CartService } from '../services/cart.service';
import { User } from '../../auth-base/user/entities/user.entity';
import { Product } from '../../product/entities/product.entity';
import { Transactional } from 'typeorm-transactional';
// import { ProductByIdDataloader } from '../../product/dataloaders/product.dataloader';

@Resolver(() => Cart)
export class CartResolver {
  constructor(private readonly cartService: CartService) {}

  @Auth()
  @Query(() => Cart, { name: 'myCart' })
  async myCart(@CurrentUser() user: { userId: string }) {
    return this.cartService.getCart(user.userId);
  }

  @Auth()
  @Mutation(() => Cart)
  @Transactional()
  async addToCart(
    @Args('input') input: AddToCartInput,
    @CurrentUser() user: User,
  ) {
    return this.cartService.addToCart(user, input);
  }

  @Auth()
  @Mutation(() => Cart)
  @Transactional()
  async updateCartItem(
    @Args('input') input: UpdateCartItemInput,
    @CurrentUser() user: User,
  ) {
    return this.cartService.updateCartItem(user, input);
  }

  @Auth()
  @Mutation(() => Cart)
  @Transactional()
  async removeFromCart(
    @Args('cartItemId') cartItemId: string,
    @CurrentUser() user: User,
  ) {
    return this.cartService.removeFromCart(user, cartItemId);
  }
}

@Resolver(() => CartItem)
export class CartItemResolver {
  // constructor(private readonly productLoader: ProductByIdDataloader) {}

  // @ResolveField(() => Product)
  // async product(@Parent() cartItem: CartItem) {
  //   if (cartItem.product) return cartItem.product;
  //   if (!cartItem.productId) return null;
  //   return this.productLoader.getDataloader().load(cartItem.productId);
  // }
}
