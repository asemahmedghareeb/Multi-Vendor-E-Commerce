import { Injectable } from '@nestjs/common';
import { User } from '../../auth-base/user/entities/user.entity';
import { Cart } from '../entities/cart.entity';
import { CartItem } from '../entities/cart-item.entity';
import { AddToCartInput } from '../dto/inputs/add-to-cart.input';
import { UpdateCartItemInput } from '../dto/inputs/update-cart-item-input';
import { Product } from '../../product/entities/product.entity';
import { InjectAppRepository } from 'src/common/decorators/inject-app-repository.decorator';
import { AppRepository } from 'src/modules/core/app-database/repositories/app.repository';
import { ErrorCodeEnum } from 'src/common/enums/error-code.enum';
import { AppHttpException } from 'src/common/exceptions/app-http.exception';
import { PaginatorInput } from 'src/common/dtos/inputs/paginator.input';
import { FindOptionsRelations } from 'typeorm';

@Injectable()
export class CartService {
  constructor(
    @InjectAppRepository(Cart) private cartRepo: AppRepository<Cart>,
    @InjectAppRepository(CartItem)
    private cartItemRepo: AppRepository<CartItem>,
    @InjectAppRepository(Product) private productRepo: AppRepository<Product>,
    @InjectAppRepository(User) private userRepo: AppRepository<User>,
  ) {}


  async getCart(user: User, pagination: PaginatorInput) {
    const { page, limit } = pagination;
    let cart = await this.cartRepo.findOne({
      where: { user: { id: user.id } },
      relations: ['items', 'items.product', 'items.product.vendor'],
      order: { items: { createdAt: 'ASC' } },
    });
    if (!cart) {
      cart = await this.createCart(user);
      return cart;
    }
    return this.cartItemRepo.findPaginated(
      { cart: { id: cart.id } },
      { createdAt: 'DESC' },
      page,
      limit,
      ['product', 'product.vendor'] as FindOptionsRelations<CartItem>,
    );
  }

  async createCart(user: User): Promise<Cart> {
    const cart = this.cartRepo.create({
      user: user,
      items: [],
      totalAmount: 0,
    });
    return await this.cartRepo.save(cart);
  }

  async addToCart(user: User, input: AddToCartInput): Promise<Cart> {
    const userId = user.id;
    let cart = await this.cartRepo.findOne({
      where: { user: { id: userId } },
      relations: ['items', 'items.product'],
    });

    if (!cart) {
      const user = await this.userRepo.findOne({ where: { id: userId } });
      if (!user) {
        throw new AppHttpException(ErrorCodeEnum.NOT_FOUND);
      }
      cart = await this.createCart(user);
    }

    const product = await this.productRepo.findOneOrFail({
      where: { id: input.productId },
    });

    let cartItem = cart.items.find(
      (item) => item.product.id === input.productId,
    );

    if (cartItem) {
      const newQuantity = cartItem.quantity + input.quantity;

      if (product.inventoryCount < newQuantity) {
        throw new AppHttpException(ErrorCodeEnum.INSUFFICIENT_INVENTORY, {
          count: product.inventoryCount,
        });
      }

      cartItem.quantity = newQuantity;
      await this.cartItemRepo.save(cartItem);
    } else {
      if (product.inventoryCount < input.quantity) {
        throw new AppHttpException(ErrorCodeEnum.INSUFFICIENT_INVENTORY, {
          count: product.inventoryCount,
        });
      }

      cartItem = this.cartItemRepo.create({
        cart,
        product,
        quantity: input.quantity,
      });

      await this.cartItemRepo.save(cartItem);

      cart.items.push(cartItem);
    }

    cart.totalAmount = cart.items.reduce((sum, item) => {
      return sum + item.quantity * item.product.price;
    }, 0);

    await this.cartRepo.save(cart);

    return cart;
  }

  // async updateCartItem(user: User, input: UpdateCartItemInput): Promise<Cart> {
  //   const userId = user.id;
  //   const cart = await this.getCart(userId);

  //   const cartItem = await this.cartItemRepo.findOneOrFail({
  //     where: { id: input.cartItemId, cart: { id: cart.id } },
  //     relations: ['product'],
  //   });

  //   if (cartItem.product.inventoryCount < input.quantity) {
  //     throw new AppHttpException(ErrorCodeEnum.INSUFFICIENT_INVENTORY, {
  //       count: cartItem.product.inventoryCount,
  //     });
  //   }
  //   cartItem.quantity = input.quantity;
  //   await this.cartItemRepo.save(cartItem);
  //   // return this.getCart(userId);
  // }

  // async removeFromCart(user: User, cartItemId: string): Promise<Cart> {
  //   const userId = user.id;
  //   // const cart = await this.getCart(userId);

  //   const result = await this.cartItemRepo.delete({
  //     id: cartItemId,
  //     cart: { id: cart.id },
  //   });

  //   if (result.affected === 0)
  //     throw new AppHttpException(ErrorCodeEnum.NOT_FOUND);

  //   return this.getCart(userId);
  // }
}
