import { Injectable, Inject } from '@nestjs/common';
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
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { instanceToPlain } from 'class-transformer';

@Injectable()
export class CartService {
  constructor(
    @InjectAppRepository(Cart) private cartRepo: AppRepository<Cart>,
    @InjectAppRepository(CartItem)
    private cartItemRepo: AppRepository<CartItem>,
    @InjectAppRepository(Product) private productRepo: AppRepository<Product>,
    @InjectAppRepository(User) private userRepo: AppRepository<User>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  private getCartCacheKey(userId: string): string {
    return `cart:${userId}`;
  }

  async getCartForUser(userId: string): Promise<Cart> {
    const cacheKey = this.getCartCacheKey(userId);

    const cachedData = await this.cacheManager.get<string>(cacheKey);
    if (cachedData) {
      console.log('cart from cache');
      return cachedData as unknown as Cart; 
    }

    // 2. Fetch from DB if miss
    let cart = await this.cartRepo.findOne({
      where: { user: { id: userId } },
      relations: ['items', 'items.product', 'items.product.vendor'],
    });

    if (!cart) {
      const user = await this.userRepo.findOneOrFail({ where: { id: userId } });
      cart = await this.createCart(user);
    }

    const safeCart = instanceToPlain(cart);

    await this.cacheManager.set(cacheKey, safeCart, 3600000);

    return cart;
  }

  async getCart(user: User, pagination: PaginatorInput) {
    const { page, limit } = pagination;
    let cart = await this.cartRepo.findOne({
      where: { user: { id: user.id } },
      order: { items: { createdAt: 'ASC' } },
    });
    if (!cart) {
      cart = await this.createCart(user);
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
    await this.cacheManager.del(this.getCartCacheKey(user.id));

    return cart;
  }

  async updateCartItem(
    user: User,
    input: UpdateCartItemInput,
  ): Promise<boolean> {
    const userId = user.id;
    const cart = await this.cartRepo.findOneOrFail({
      where: { user: { id: userId } },
      relations: ['items', 'items.product'],
    });

    const cartItem = cart.items.find((item) => item.id === input.cartItemId);
    if (!cartItem) {
      throw new AppHttpException(ErrorCodeEnum.NOT_FOUND);
    }

    if (cartItem.product.inventoryCount < input.quantity) {
      throw new AppHttpException(ErrorCodeEnum.INSUFFICIENT_INVENTORY, {
        count: cartItem.product.inventoryCount,
      });
    }
    cartItem.quantity = input.quantity;
    await this.cartItemRepo.save(cartItem);
    await this.cacheManager.del(this.getCartCacheKey(user.id));
    return true;
  }

  async removeFromCart(user: User, cartItemId: string): Promise<boolean> {
    const cart = await this.cartRepo.findOneOrFail({
      where: { user: { id: user.id } },
      relations: ['items', 'items.product'],
    });

    const cartItem = cart.items.find((item) => item.id === cartItemId);
    if (!cartItem) {
      throw new AppHttpException(ErrorCodeEnum.NOT_FOUND);
    }
    cart.items = cart.items.filter((item) => item.id !== cartItemId);
    cart.totalAmount = cart.items.reduce((sum, item) => {
      return sum + item.quantity * item.product.price;
    }, 0);
    await this.cartRepo.save(cart);
    await this.cacheManager.del(this.getCartCacheKey(user.id));

    return true;
  }
}
