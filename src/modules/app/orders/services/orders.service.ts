import { Injectable } from '@nestjs/common';
import { InjectAppRepository } from 'src/common/decorators/inject-app-repository.decorator';
import { PaginatorInput } from 'src/common/dtos/inputs/paginator.input';
import { Order } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { AppRepository } from 'src/modules/core/app-database/repositories/app.repository';
import { Product } from '../../product/entities/product.entity';
import { User } from '../../auth-base/user/entities/user.entity';
import { Cart } from '../../cart/entities/cart.entity';
import { AppHttpException } from 'src/common/exceptions/app-http.exception';
import { ErrorCodeEnum } from 'src/common/enums/error-code.enum';
import { CreateOrderInput } from '../dto/inputs/create-order.input';
import { OrderStatus } from '../enum/order-status.enum';
import { OrderTracking } from '../entities/order-tracking.entity';
import { PaymentService } from 'src/modules/core/payment/services/payment.service';
import { AppConfig } from 'src/config/app.config';
import { CurrenciesEnum } from 'src/common/enums/currency.enum';
import { UserRoleEnum } from 'src/common/enums/user-role.enum';
import { UpdateOrderStatusInput } from '../dto/inputs/update-order-status.input';
@Injectable()
export class OrdersService {
  constructor(
    @InjectAppRepository(Order)
    private readonly orderRepo: AppRepository<Order>,
    @InjectAppRepository(OrderItem)
    private readonly orderItemRepo: AppRepository<OrderItem>,
    @InjectAppRepository(Product)
    private readonly productRepo: AppRepository<Product>,
    @InjectAppRepository(User)
    private readonly userRepo: AppRepository<User>,
    @InjectAppRepository(Cart)
    private readonly cartRepo: AppRepository<Cart>,
    @InjectAppRepository(OrderTracking)
    private readonly orderTrackingRepo: AppRepository<OrderTracking>,
    private readonly paymentService: PaymentService,
  ) {}

  async findAllOrders(pagination: PaginatorInput) {
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 10;

    return this.orderRepo.findPaginated(
      undefined,
      { createdAt: 'DESC' },
      page,
      limit,
    );
  }

  async createOrder(
    user: User,
    input: CreateOrderInput,
  ): Promise<Order> {
    const cart = await this.cartRepo.findOneOrFail({
      where: { user: { id: user.id } },
      relations: ['items', 'user', 'items.product', 'items.product.vendor'],
      order: { items: { createdAt: 'ASC' } },
    });

    if (!cart.items || cart.items.length === 0) {
      throw new AppHttpException(ErrorCodeEnum.BAD_REQUEST_EXCEPTION);
    }

    const sortedCartItems = cart.items.sort((a, b) =>
      a.product_id.localeCompare(b.product_id),
    );

    let totalAmount = 0;
    const orderItemsToCreate: OrderItem[] = [];

    for (const item of sortedCartItems) {
      const product = await this.productRepo.findOneOrFail({
        where: { id: item.product_id },
        // lock: { mode: 'pessimistic_write' },
        relations: ['vendor'],
      });

      if (product.inventoryCount < item.quantity) {
        throw new AppHttpException(ErrorCodeEnum.BAD_REQUEST_EXCEPTION);
      }

      totalAmount += product.price * item.quantity;

      const orderItem = this.orderItemRepo.create({
        product: product,
        vendor: product.vendor,
        quantity: item.quantity,
        priceAtPurchase: product.price,
        status: OrderStatus.PENDING,
      });

      orderItemsToCreate.push(orderItem);

      await this.productRepo.decrement(
        { id: product.id },
        'inventoryCount',
        item.quantity,
      );
    }

    const usr = await this.userRepo.findOne({ where: { id: user.id } });

    const order = this.orderRepo.create({
      user: usr!,
      totalAmount,
      shippingAddress: input.shippingAddress,
      status: OrderStatus.PENDING,
    });

    const savedOrder = await this.orderRepo.save(order);

    orderItemsToCreate.forEach((item) => (item.order = savedOrder));
    const savedOrderItems = await this.orderItemRepo.save(orderItemsToCreate);

    const trackingRecords = savedOrderItems.map((savedItem) => {
      return this.orderTrackingRepo.create({
        orderItem: savedItem,
        remarks: 'Order created',
        status: OrderStatus.PENDING,
      });
    });

    await this.orderTrackingRepo.save(trackingRecords);

    const payment = await this.paymentService.createPaymentIntent(
      input.paymentGateway,
      savedOrder.totalAmount,
      AppConfig.appGeneralCurrency as CurrenciesEnum,
      { order_id: savedOrder.id },
      user,
      // savedOrder.id,
      savedOrder,
    );


    savedOrder.payment = payment;

        await this.orderTrackingRepo.save(trackingRecords);
        await this.cartRepo.delete({ id: cart.id });


    return savedOrder;
  }

  async getMyOrders(userId: string, pagination: PaginatorInput) {
    await this.userRepo.findOneOrFail({ where: { id: userId } });
    const page = pagination.page;
    const limit = pagination.limit;
    return this.orderRepo.findPaginated(
      { user: { id: userId } },
      { createdAt: 'DESC' },
      page,
      limit,
    );
  }

  async getOrder(orderId: string, user: User): Promise<Order> {
    const order = await this.orderRepo.findOneOrFail({
      where: { id: orderId },
    });

    if (order.userId !== user.id && user.role !== UserRoleEnum.ADMIN) {
      throw new AppHttpException(ErrorCodeEnum.FORBIDDEN);
    }

    return order;
  }

  async updateOrderStatus(input: UpdateOrderStatusInput): Promise<Order> {
    const order = await this.orderRepo.findOneOrFail({
      where: { id: input.orderId },
      relations: ['items'],
    });

    order.status = input.status;

    const trackingRecords = order.items.map((item) => {
      return this.orderTrackingRepo.create({
        orderItem: item,
        remarks: `Order status updated to ${input.status}`,
        status: input.status,
      });
    });

    await this.orderTrackingRepo.save(trackingRecords);

    return this.orderRepo.save(order);
  }
}
