import {
  Resolver,
  Mutation,
  Args,
  Query,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { Order } from '../entities/order.entity';
import { PaginatorInput } from 'src/common/dtos/inputs/paginator.input';
import { Auth } from 'src/common/decorators/auth.decorator';
import { UserRoleEnum } from 'src/common/enums/user-role.enum';
import { Payment } from 'src/modules/core/payment/entities/payment.entity';
import { OrdersPaginated } from '../dto/responses/paginated-orders';
import { User } from '../../auth-base/user/entities/user.entity';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { OrderItem } from '../entities/order-item.entity';
import { CreateOrderInput } from '../dto/inputs/create-order.input';
import { OrdersService } from '../services/orders.service';
import { DefaultPermissionActionsEnum } from 'src/common/enums/default-permissions.enum';
import { OrderItemsLoader } from '../dataloaders/order-items.dataloader';
import { UserDataloader } from '../../auth-base/session/dataloaders/user.dataloader';
import { Transactional } from 'typeorm-transactional';
import { PaymentDataloader } from '../dataloaders/payment.dataloader';

@Resolver(() => Order)
export class OrdersResolver {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly orderItemsLoader: OrderItemsLoader,
    private readonly userLoader: UserDataloader,
    private readonly paymentLoader: PaymentDataloader,
  ) {}

  @Query(() => OrdersPaginated)
  @Auth({
    roles: [UserRoleEnum.ADMIN],
    permissions: [
      {
        action: DefaultPermissionActionsEnum.READ,
        target: Order.permissionsTarget,
      },
    ],
  })
  async orders(
    @Args('pagination', { nullable: true })
    pagination: PaginatorInput,
  ) {
    return this.ordersService.findAllOrders(pagination);
  }

  @Auth()
  @Mutation(() => Order)
  @Transactional()
  async createOrder(
    @Args('input') input: CreateOrderInput,
    @CurrentUser() user: User,
  ) {
    return this.ordersService.createOrder(user, input);
  }

  //for clients
  @Auth()
  @Query(() => OrdersPaginated)
  async myOrders(
    @CurrentUser() user: User,
    @Args('pagination') pagination: PaginatorInput,
  ) {
    return this.ordersService.getMyOrders(user.id, pagination);
  }

  @Auth({
    roles: [UserRoleEnum.ADMIN, UserRoleEnum.VENDOR],
    permissions: [
      {
        action: DefaultPermissionActionsEnum.READ,
        target: Order.permissionsTarget,
      },
    ],
  })
  @Query(() => Order, { name: 'order' })
  async getOrder(@Args('id') id: string, @CurrentUser() user: User) {
    return this.ordersService.getOrder(id, user);
  }

  @ResolveField(() => [OrderItem])
  async items(@Parent() order: Order) {
    if (order.items) return order.items;

    return this.orderItemsLoader.getDataloader().load(order.id);
  }
  @ResolveField(() => User)
  async user(@Parent() order: Order) {
    if (order.user) return order.user;
    return this.userLoader.getDataloader().load(order.userId);
  }

  @ResolveField(() => Payment, { nullable: true })
  async payment(@Parent() order: Order) {
    if (order.payment) {
      return order.payment;
    }
    return this.paymentLoader.getDataloader().load(order.id);
  }
}
