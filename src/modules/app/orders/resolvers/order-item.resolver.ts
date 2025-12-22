import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { OrderItem } from '../entities/order-item.entity';
import { Vendor } from '../../vendors/entities/vendor.entity';
import { Product } from '../../product/entities/product.entity';
import { ProductsDataloader } from '../dataloaders/product.dataloader';
import { VendorDataloader } from '../../product/dataloaders/vendor.dataloader';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { User } from '../../auth-base/user/entities/user.entity';
import { PaginatorInput } from 'src/common/dtos/inputs/paginator.input';
import { OrderItemService } from '../services/order-item.service';
import { Order } from '../entities/order.entity';
import { OrderDataloader } from '../dataloaders/order.dataloader';
import { Auth } from 'src/common/decorators/auth.decorator';
import { DefaultPermissionActionsEnum } from 'src/common/enums/default-permissions.enum';
import { Transactional } from 'typeorm-transactional';
import { OrderStatus } from '../enum/order-status.enum';
import { UserRoleEnum } from 'src/common/enums/user-role.enum';

@Resolver(() => OrderItem)
export class OrderItemResolver {
  constructor(
    private readonly productLoader: ProductsDataloader,
    private readonly vendorLoader: VendorDataloader,
    private readonly orderItemService: OrderItemService,
    private readonly orderLoader: OrderDataloader,
  ) {}

  //for vendors and admins
  @Auth({
    roles: [UserRoleEnum.ADMIN, UserRoleEnum.VENDOR],
    permissions: [
      {
        action: DefaultPermissionActionsEnum.READ,
        target: OrderItem.permissionsTarget,
      },
    ],
  })
  @Query(() => [OrderItem])
  async vendorOrders(
    @CurrentUser() user: User,
    @Args('pagination') pagination: PaginatorInput,
  ) {
    return this.orderItemService.getVendorOrderedItems(user.id, pagination);
  }

  @Auth({
    roles: [UserRoleEnum.ADMIN, UserRoleEnum.VENDOR],
    permissions: [
      {
        action: DefaultPermissionActionsEnum.UPDATE,
        target: OrderItem.permissionsTarget,
      },
    ],
  })
  @Transactional()
  @Mutation(() => OrderItem)
  async updateItemStatus(
    @Args('itemId') itemId: string,
    @Args('status', { type: () => OrderStatus }) status: OrderStatus,
    @CurrentUser() user: User,
  ) {
    return this.orderItemService.updateOrderItemStatus(user, itemId, status);
  }

  // @ResolveField(() => Product)
  // async product(@Parent() orderItem: OrderItem) {
  //   if (orderItem.product) return orderItem.product;
  //   return this.productLoader.getDataloader().load(orderItem.productId);
  // }

  // @ResolveField(() => Vendor)
  // async vendor(@Parent() orderItem: OrderItem) {
  //   if (orderItem.vendor) return orderItem.vendor;
  //   return this.vendorLoader.getDataloader().load(orderItem.vendorId);
  // }

  @ResolveField(() => Order)
  async order(@Parent() orderItem: OrderItem) {
    if (orderItem.order) return orderItem.order;
    return this.orderLoader.getDataloader().load(orderItem.orderId);
  }
}
