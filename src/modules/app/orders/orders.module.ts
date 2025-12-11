import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrderItemResolver, OrdersResolver } from './orders.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { User } from 'src/users/entities/user.entity';
import { CartModule } from 'src/cart/cart.module';
import { Payment } from 'src/payments/entities/payment.entity';
import { Product } from 'src/products/entities/product.entity';
import { CartItem } from 'src/cart/entities/cart-item.entity';
import { OrderTracking } from './entities/order-tracking.entity';
import { Cart } from 'src/cart/entities/cart.entity';
import { Vendor } from 'src/vendors/entities/vendor.entity';
import { PaymentsModule } from 'src/payments/payments.module';
import { DataLoadersModule } from 'src/dataLoaders/dataLoaders.module';
import { Device } from 'src/users/entities/device.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      OrderItem,
      OrderTracking,
      Product,
      Cart,
      CartItem,
      User,
      Vendor,
      Payment,
      Device,
    ]),
    CartModule,
    PaymentsModule,
    DataLoadersModule,
  ],
  providers: [OrdersResolver, OrdersService, OrderItemResolver],
  exports: [OrdersService],
})
export class OrdersModule {}
