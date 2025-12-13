import { Module } from '@nestjs/common';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { CartItemResolver, CartResolver } from './resolvers/cart.resolver';
import { CartService } from './services/cart.service';
import { Product } from '../product/entities/product.entity';
import { User } from '../auth-base/user/entities/user.entity';
import { ProductModule } from '../product/product.module';
import { AppDatabaseModule } from 'src/modules/core/app-database/app-database.module';


@Module({
  imports: [AppDatabaseModule.forFeature([Cart, CartItem, Product, User]),ProductModule],
  providers: [CartResolver, CartItemResolver, CartService],
  exports: [],
})
export class CartModule {}
