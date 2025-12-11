import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wishlist } from './entities/wishlist.entity';
import { WishlistItem } from './entities/wishlist-item.entity';
import { Product } from '../products/entities/product.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class WishlistService {
  constructor(
    @InjectRepository(Wishlist) private wishlistRepo: Repository<Wishlist>,
    @InjectRepository(WishlistItem)
    private wishlistItemRepo: Repository<WishlistItem>,
    @InjectRepository(Product) private productRepo: Repository<Product>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  async getWishlist(userId: string): Promise<Wishlist> {
    let wishlist = await this.wishlistRepo.findOne({
      where: { user: { id: userId } },
      relations: ['items', 'user'],
      order: { items: { createdAt: 'DESC' } },
    });

    if (!wishlist) {
      const user = await this.userRepo.findOne({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException('events.auth.USER_NOT_FOUND');
      }

      wishlist = this.wishlistRepo.create({
        user: user,
        items: [],
      });
      await this.wishlistRepo.save(wishlist);
    }

    return wishlist;
  }

  async addToWishlist(userId: string, productId: string): Promise<Wishlist> {
    let wishlist = await this.wishlistRepo.findOne({
      where: { user: { id: userId } },
      relations: ['items', 'user'],
    });

    if (!wishlist) {
      const user = await this.userRepo.findOne({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException('events.auth.USER_NOT_FOUND');
      }

      wishlist = this.wishlistRepo.create({
        user: user,
        items: [],
      });
      await this.wishlistRepo.save(wishlist);
    }

    const exists = wishlist.items.find((item) => item.productId === productId);
    if (exists) {
      throw new BadRequestException('events.wishlist.PRODUCT_ALREADY_EXISTS');
    }

    const product = await this.productRepo.findOne({
      where: { id: productId },
    });
    if (!product) throw new NotFoundException('events.product.NOT_FOUND');

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
      throw new NotFoundException('Wishlist not found');
    }

    const item = await this.wishlistItemRepo.findOne({
      where: { wishlist: { id: wishlist.id }, product: { id: productId } },
    });

    if (!item) throw new NotFoundException('Item not found in wishlist');

    await this.wishlistItemRepo.remove(item);

    wishlist.items = wishlist.items.filter((i) => i.id !== item.id);

    return wishlist;
  }
}