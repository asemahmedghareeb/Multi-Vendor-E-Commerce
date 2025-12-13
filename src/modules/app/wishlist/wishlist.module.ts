import { Module } from '@nestjs/common';
// import { WishlistService } from './wishlist.service';
// import { WishlistItemResolver, WishlistResolver } from './wishlist.resolver';
import { Wishlist } from './entities/wishlist.entity';
import { WishlistItem } from './entities/wishlist-item.entity';

// import { DataLoadersModule } from 'src/dataLoaders/dataLoaders.module';
import { Product } from '../product/entities/product.entity';
import { User } from '../auth-base/user/entities/user.entity';
import { AppDatabaseModule } from 'src/modules/core/app-database/app-database.module';


@Module({
  imports: [
    AppDatabaseModule.forFeature([Wishlist, WishlistItem, Product, User]),
    // DataLoadersModule,
  ],
  // providers: [WishlistResolver, WishlistService, WishlistItemResolver],
})
export class WishlistModule {}
