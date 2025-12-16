import { Module } from '@nestjs/common';
import { Wishlist } from './entities/wishlist.entity';
import { WishlistItem } from './entities/wishlist-item.entity';
import { Product } from '../product/entities/product.entity';
import { User } from '../auth-base/user/entities/user.entity';
import { AppDatabaseModule } from 'src/modules/core/app-database/app-database.module';
import { WishlistService } from './services/wishlist.service';
import { WishlistResolver } from './resolvers/wishlist.resolver';

@Module({
  imports: [
    AppDatabaseModule.forFeature([Wishlist, WishlistItem, Product, User]),
  ],
  providers: [WishlistResolver, WishlistService],
})
export class WishlistModule {}
