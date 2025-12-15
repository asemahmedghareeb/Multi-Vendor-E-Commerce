import { Module } from '@nestjs/common';
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
import { Order } from './entities/order.entity';
import { OrdersService } from './services/orders.service';
import { OrdersResolver } from './resolvers/orders.resolver';
import { VendorsModule } from '../vendors/vendors.module';
import { OrderItemService } from './services/order-item.service';
import { UserDataloader } from '../auth-base/session/dataloaders/user.dataloader';
import { OrderItemResolver } from './resolvers/order-item.resolver';
import { OrderItemsLoader } from './dataloaders/order-items.dataloader';
import { ProductsDataloader } from '../cart/dataloaders/product.dataloader';
import { VendorDataloader } from '../product/dataloaders/vendor.dataloader';
import { OrderDataloader } from './dataloaders/order.dataloader';
import { PaymentDataloader } from './dataloaders/payment.dataloader';


@Module({
  imports: [
    AppDatabaseModule.forFeature([
      Order,
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
    VendorsModule,
  ],
  providers: [
    OrdersResolver,
    OrdersService,
    OrderItemService,
    OrderItemResolver,
    OrderItemsLoader,
    UserDataloader,
    ProductsDataloader,
    VendorDataloader,
    OrderDataloader,
    PaymentDataloader,
  ],
  exports: [OrdersService],
})
export class OrdersModule {}
