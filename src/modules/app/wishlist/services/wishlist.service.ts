import { Injectable } from '@nestjs/common';
import { Wishlist } from '../entities/wishlist.entity';
import { WishlistItem } from '../entities/wishlist-item.entity';
import { Product } from '../../product/entities/product.entity';
import { User } from '../../auth-base/user/entities/user.entity';
import { AppRepository } from 'src/modules/core/app-database/repositories/app.repository';
import { InjectAppRepository } from 'src/common/decorators/inject-app-repository.decorator';
import { AppHttpException } from 'src/common/exceptions/app-http.exception';
import { ErrorCodeEnum } from 'src/common/enums/error-code.enum';
import { PaginatorInput } from 'src/common/dtos/inputs/paginator.input';
import { FindOptionsRelations } from 'typeorm';

@Injectable()
export class WishlistService {
  constructor(
    @InjectAppRepository(Wishlist)
    private wishlistRepo: AppRepository<Wishlist>,
    @InjectAppRepository(WishlistItem)
    private wishlistItemRepo: AppRepository<WishlistItem>,
    @InjectAppRepository(Product)
    private productRepo: AppRepository<Product>,
  ) {}

  async getWishlist(user: User, pagination: PaginatorInput) {
    const { page, limit } = pagination;
    let wishlist = await this.wishlistRepo.findOne({
      where: { userId: user.id },
    });

    if (!wishlist) {
      wishlist = await this.createWishlist(user);
    }

    const paginatedItems = await this.wishlistItemRepo.findPaginated(
      { wishlistId: wishlist.id },
      { createdAt: 'DESC' },
      page,
      limit,
      ['product', 'product.vendor'] as FindOptionsRelations<WishlistItem>,
    );

    return paginatedItems;
  }

  async createWishlist(user: User) {
    const wishlist = this.wishlistRepo.create({
      user: user,
      items: [],
    });
    return await this.wishlistRepo.save(wishlist);
  }

  async addToWishlist(user: User, productId: string): Promise<Wishlist> {
    let wishlist = await this.wishlistRepo.findOne({
      where: { user: { id: user.id } },
      relations: ['items', 'user'],
    });

    if (!wishlist) {
      wishlist = await this.createWishlist(user);
    }

    const exists = wishlist.items.find((item) => item.productId === productId);
    if (exists) {
      throw new AppHttpException(ErrorCodeEnum.BAD_REQUEST_EXCEPTION);
    }

    const product = await this.productRepo.findOneOrFail({
      where: { id: productId },
    });

    const item = this.wishlistItemRepo.create({
      wishlist,
      product,
    });

    await this.wishlistItemRepo.save(item);
    wishlist.items.unshift(item);

    return wishlist;
  }

  async removeFromWishlist(
    userId: string,
    productId: string,
  ): Promise<Wishlist> {
    const wishlist = await this.wishlistRepo.findOne({
      where: { user: { id: userId } },
      relations: ['items', 'user'],
    });

    if (!wishlist) {
      throw new AppHttpException(ErrorCodeEnum.NOT_FOUND);
    }

    const item = await this.wishlistItemRepo.findOneOrFail({
      where: { wishlist: { id: wishlist.id }, product: { id: productId } },
    });

    await this.wishlistItemRepo.remove(item);

    wishlist.items = wishlist.items.filter((i) => i.id !== item.id);

    return wishlist;
  }
}
