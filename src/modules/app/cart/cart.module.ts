import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { CartItemResolver, CartResolver } from './resolvers/cart.resolver';
import { CartService } from './services/cart.service';
import { ProductModule } from '../product/product.module';

@Module({
  imports: [TypeOrmModule.forFeature([Cart, CartItem]),ProductModule],
  providers: [CartResolver, CartItemResolver, CartService],
  exports: [],
})
export class CartModule {}
