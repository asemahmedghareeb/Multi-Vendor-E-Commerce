import { Injectable } from '@nestjs/common';
import { InjectAppRepository } from 'src/common/decorators/inject-app-repository.decorator';
import { AppRepository } from 'src/modules/core/app-database/repositories/app.repository';
import { Vendor } from '../../vendors/entities/vendor.entity';
import { OrderItem } from '../entities/order-item.entity';
import { PaginatorInput } from 'src/common/dtos/inputs/paginator.input';
import { OrderStatus } from '../enum/order-status.enum';
import { User } from '../../auth-base/user/entities/user.entity';
import { AppHttpException } from 'src/common/exceptions/app-http.exception';
import { ErrorCodeEnum } from 'src/common/enums/error-code.enum';
import { UserRoleEnum } from 'src/common/enums/user-role.enum';
import { OrderTracking } from '../entities/order-tracking.entity';
import { NotificationService } from '../../notification/services/notification.service';
import { SendNotificationInput } from '../../notification/dtos/inputs/send-notification.input';
import { NotificationTargetEnum } from '../../notification/enums/notification-target.enum';
import { NotificationTypeEnum } from '../../notification/enums/notification-type.enum';

@Injectable()
export class OrderItemService {
  constructor(
    @InjectAppRepository(Vendor)
    private readonly vendorRepo: AppRepository<Vendor>,
    @InjectAppRepository(OrderItem)
    private readonly orderItemRepo: AppRepository<OrderItem>,
    @InjectAppRepository(OrderTracking)
    private readonly orderTrackingRepo: AppRepository<OrderTracking>,
    private readonly notificationService: NotificationService,
  ) {}
  async getVendorOrderedItems(userId: string, pagination: PaginatorInput) {
    const vendor = await this.vendorRepo.findOneOrFail({
      where: { id: userId },
    });
    const page = pagination.page;
    const limit = pagination.limit;
    return this.orderItemRepo.findPaginated(
      { vendorId: vendor.id },
      { createdAt: 'DESC' },
      page,
      limit,
    );
  }

  //TODO: get order items query and make it paginated (because the order may have many items)  
  async updateOrderItemStatus(
    user: User,
    itemId: string,
    newStatus: OrderStatus,
  ): Promise<OrderItem> {
    const item = await this.orderItemRepo.findOneOrFail({
      where: { id: itemId },
      relations: ['vendor', 'order'],
    });

    if (user.role !== UserRoleEnum.ADMIN && item.vendor.userId !== user.id) {
      throw new AppHttpException(ErrorCodeEnum.FORBIDDEN);
    }

    if (item.status === newStatus) {
      throw new AppHttpException(ErrorCodeEnum.BAD_REQUEST_EXCEPTION);
    }

    item.status = newStatus;
    const savedItem = await this.orderItemRepo.save(item);

    await this.orderTrackingRepo.save({
      orderItem: savedItem,
      status: newStatus,
      remarks: 'Updated by vendor',
    });

    const notificationInput: SendNotificationInput = {
      enTitle: 'Order Status Updated',
      arTitle: 'تم تحديث حالة الطلب',
      enBody: `The status of your item has been updated to ${newStatus}.`,
      arBody: `تم تحديث حالة طلبك إلى ${newStatus}.`,
      receiverUserIds: [item.order.userId],
      inAppOnly: false,
      metadata: {
        notificationTarget: NotificationTargetEnum.ORDER_STATUS,
        notificationType: NotificationTypeEnum.ORDER_STATUS_UPDATED,
      },
    };
    await this.notificationService.SendNotification(notificationInput);

    return savedItem;
  }
}
