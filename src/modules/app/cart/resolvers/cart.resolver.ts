import {
  Resolver,
  Query,
  Mutation,
  Args,
} from '@nestjs/graphql';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Auth } from 'src/common/decorators/auth.decorator';
import { Cart } from '../entities/cart.entity';
import { AddToCartInput } from '../dto/inputs/add-to-cart.input';
import { UpdateCartItemInput } from '../dto/inputs/update-cart-item-input';
import { CartService } from '../services/cart.service';
import { User } from '../../auth-base/user/entities/user.entity';
import { Transactional } from 'typeorm-transactional';
import { NullablePaginatorArgsInput, PaginatorInput } from 'src/common/dtos/inputs/paginator.input';
import { CartItemPaginated } from '../dto/responses/cart-item-paginated.response';
@Resolver(() => Cart)
export class CartResolver {
  constructor(private readonly cartService: CartService) {}

  @Auth()
  @Query(() => CartItemPaginated)
  async myCart(
    @CurrentUser() user: User,
    @Args({ nullable: true }) paginationInput: NullablePaginatorArgsInput,
  ) {
    return this.cartService.getCart(user, paginationInput?.paginate);
  }

  @Query(() => Cart)
  async Cart(@CurrentUser() user: User) {
    return this.cartService.getCartForUser(user);
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
  @Mutation(() => Boolean)
  @Transactional()
  async updateCartItem(
    @Args('input') input: UpdateCartItemInput,
    @CurrentUser() user: User,
  ) {
    return this.cartService.updateCartItem(user, input);
  }

  @Auth()
  @Mutation(() => Boolean)
  @Transactional()
  async removeFromCart(
    @Args('cartItemId') cartItemId: string,
    @CurrentUser() user: User,
  ) {
    return this.cartService.removeFromCart(user, cartItemId);
  }
}