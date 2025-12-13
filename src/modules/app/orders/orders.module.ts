import { Module } from '@nestjs/common';
// import { OrdersService } from './orders.service';
// import { OrderItemResolver, OrdersResolver } from './orders.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OrderItem } from './entities/order-item.entity';


import { OrderTracking } from './entities/order-tracking.entity';
import { Product } from '../product/entities/product.entity';
import { Cart } from '../cart/entities/cart.entity';
import { CartItem } from '../cart/entities/cart-item.entity';
import { User } from '../auth-base/user/entities/user.entity';
import { Vendor } from '../vendors/entities/vendor.entity';
import { Payment } from 'src/modules/core/payment/entities/payment.entity';
import { CartModule } from '../cart/cart.module';
import { AppDatabaseModule } from 'src/modules/core/app-database/app-database.module';


@Module({
  imports: [
    AppDatabaseModule.forFeature([
      // Order,
      OrderItem,
      OrderTracking,
      Product,
      Cart,
      CartItem,
      User,
      Vendor,
      Payment,
    ]),
    CartModule,
  ],
  // providers: [OrdersResolver, OrdersService, OrderItemResolver],
  // exports: [OrdersService],
})
export class OrdersModule {}
