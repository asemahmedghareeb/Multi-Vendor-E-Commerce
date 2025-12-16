import {
  Resolver,
  Query,
  Mutation,
  Args,
  ResolveField,
  Root,
} from '@nestjs/graphql';

import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Auth } from 'src/common/decorators/auth.decorator';
import { Cart } from '../entities/cart.entity';
import { AddToCartInput } from '../dto/inputs/add-to-cart.input';
import { UpdateCartItemInput } from '../dto/inputs/update-cart-item-input';
import { CartService } from '../services/cart.service';
import { User } from '../../auth-base/user/entities/user.entity';
import { Transactional } from 'typeorm-transactional';
import { PaginatorInput } from 'src/common/dtos/inputs/paginator.input';
import { CartItemPaginated } from '../dto/responses/cart-item-paginated.response';
@Resolver(() => Cart)
export class CartResolver {
  constructor(private readonly cartService: CartService) {}

  @Auth()
  @Query(() => CartItemPaginated)
  async myCart(@CurrentUser() user: User, pagination: PaginatorInput) {
    return this.cartService.getCart(user, pagination);
  }

  // @ResolveField(() => CartItemPaginated)
  // async items(
  //   @Root() cart: Cart,
  //   @Args('paginate', {
  //     type: () => PaginatorInput,
  //     nullable: true,
  //     defaultValue: { page: 1, limit: 15 },
  //   })
  //   paginatorInput: PaginatorInput,
  // ): Promise<CartItemPaginated> {
  //   return this.cartService.getCartItems(cart.id, paginatorInput);
  // }

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
    // return this.cartService.updateCartItem(user, input);
  }

  @Auth()
  @Mutation(() => Cart)
  @Transactional()
  async removeFromCart(
    @Args('cartItemId') cartItemId: string,
    @CurrentUser() user: User,
  ) {
    // return this.cartService.removeFromCart(user, cartItemId);
  }
}
