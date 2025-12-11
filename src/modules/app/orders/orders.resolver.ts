import { OrderItemsLoader } from './../dataLoaders/orderItem.loader';
import {
  Resolver,
  Mutation,
  Args,
  Query,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import {
  ForbiddenException,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { Order } from './entities/order.entity';
import { CreateOrderInput } from './dto/create-order.input';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { AuthGuard } from '../auth/guards/auth.guard';
import { OrderItem } from './entities/order-item.entity';
import { OrderStatus } from './enum/order-status.enum';
import { genericPaginated } from 'src/common/dto/paginated-output';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { PaginationInput } from 'src/common/dto/pagination.input';
import { ProductLoader } from 'src/dataLoaders/products.loader';
import { VendorLoader } from 'src/dataLoaders/vendor.loader';
import { Product } from 'src/products/entities/product.entity';
import { Vendor } from 'src/vendors/entities/vendor.entity';
import { Role } from 'src/auth/guards/role.enum';

const paginatedOrders = genericPaginated(Order);
@Resolver(() => Order)
export class OrdersResolver {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly orderItemsLoader: OrderItemsLoader,
  ) {}

  @Query(() => paginatedOrders)
  @Roles(Role.SUPER_ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  async orders(
    @Args('pagination', { nullable: true }) pagination?: PaginationInput,
  ) {
    return this.ordersService.findAllOrders(
      pagination || { page: 1, limit: 10 },
    );
  }

  @Mutation(() => Order)
  @UseGuards(AuthGuard)
  async createOrder(
    @Args('input') input: CreateOrderInput,
    @CurrentUser() user: { role: string; userId: string },
  ) {
    return this.ordersService.createOrder(user, input);
  }

  @Query(() => [Order])
  @UseGuards(AuthGuard)
  async myOrders(@CurrentUser() user: User) {
    return this.ordersService.getMyOrders(user.id);
  }

  @Query(() => [OrderItem])
  @UseGuards(AuthGuard)
  async vendorOrders(@CurrentUser() user: { role: string; userId: string }) {
    return this.ordersService.getVendorOrders(user.userId);
  }

  @Mutation(() => OrderItem)
  @UseGuards(AuthGuard)
  async updateItemStatus(
    @Args('itemId') itemId: string,
    @Args('status', { type: () => OrderStatus }) status: OrderStatus,
    @CurrentUser() user: { role: string; userId: string },
  ) {
    return this.ordersService.updateOrderItemStatus(user, itemId, status);
  }

  @Query(() => Order, { name: 'order' })
  @UseGuards(AuthGuard)
  async getOrder(@Args('id') id: string, @CurrentUser() user: User) {
    return this.ordersService.getOrder(id, user.id, user.role);
  }
  @ResolveField(() => [OrderItem])
  async items(@Parent() order: Order) {
    if (order.items) return order.items;
    return this.orderItemsLoader.byOrderId.load(order.id);
  }
}

@Resolver(() => OrderItem)
export class OrderItemResolver {
  constructor(
    private readonly productLoader: ProductLoader,
    private readonly vendorLoader: VendorLoader,
  ) {}

  @ResolveField(() => Product)
  async product(@Parent() orderItem: OrderItem) {
    if (orderItem.product) return orderItem.product;

    return this.productLoader.batchProducts.load(orderItem.productId);
  }

  @ResolveField(() => Vendor)
  async vendor(@Parent() orderItem: OrderItem) {
    if (orderItem.vendor) return orderItem.vendor;

    return this.vendorLoader.batchVendors.load(orderItem.vendorId);
  }
}
