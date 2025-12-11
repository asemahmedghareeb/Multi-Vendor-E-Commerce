import { Module } from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { WishlistItemResolver, WishlistResolver } from './wishlist.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wishlist } from './entities/wishlist.entity';
import { WishlistItem } from './entities/wishlist-item.entity';
import { Product } from 'src/products/entities/product.entity';
import { DataLoadersModule } from 'src/dataLoaders/dataLoaders.module';
import { User } from 'src/users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Wishlist, WishlistItem, Product, User]),
    DataLoadersModule,
  ],
  providers: [WishlistResolver, WishlistService, WishlistItemResolver],
})
export class WishlistModule {}
