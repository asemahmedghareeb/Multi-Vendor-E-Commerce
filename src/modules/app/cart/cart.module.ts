import { Module } from '@nestjs/common';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { CartResolver } from './resolvers/cart.resolver';
import { CartService } from './services/cart.service';
import { Product } from '../product/entities/product.entity';
import { User } from '../auth-base/user/entities/user.entity';
import { ProductModule } from '../product/product.module';
import { AppDatabaseModule } from 'src/modules/core/app-database/app-database.module';
import { CacheModule } from '@nestjs/cache-manager';


@Module({
  imports: [
    AppDatabaseModule.forFeature([Cart, CartItem, Product, User]),
    ProductModule,
    CacheModule.register(),
    // CacheModule
  ],
  providers: [CartResolver, CartService],
  exports: [],
})
export class CartModule {}
