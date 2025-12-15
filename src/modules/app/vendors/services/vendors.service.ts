import { Injectable } from '@nestjs/common';
import { Vendor } from '../entities/vendor.entity';
import { User } from '../../auth-base/user/entities/user.entity';
import { PaginatorInput } from 'src/common/dtos/inputs/paginator.input';
import { VendorStatus } from '../enums/vendor-status.enum';
import { RequestVendorInput } from '../dtos/inputs/request-vendor.input';
import { InjectAppRepository } from 'src/common/decorators/inject-app-repository.decorator';
import { AppRepository } from 'src/modules/core/app-database/repositories/app.repository';
import { AdminGroup } from '../../auth-base/admin-group/entities/admin-group.entity';
import { AdminGroupScopeEnum } from 'src/common/enums/admin-group-scope.enum';
import { MailService } from 'src/modules/core/mail/services/mail.service';
import { MailSubjectEnum } from 'src/modules/core/mail/enums/mail-subject.enum';
import { MailTemplateEnum } from 'src/modules/core/mail/enums/mail-template.enum';
import { NotificationService } from '../../notification/services/notification.service';
import { SendNotificationInput } from '../../notification/dtos/inputs/send-notification.input';
import { NotificationTargetEnum } from '../../notification/enums/notification-target.enum';
import { NotificationTypeEnum } from '../../notification/enums/notification-type.enum';
import { Product } from '../../product/entities/product.entity';
import { Review } from '../../reviews/entities/review.entity';
import { VendorProductsInput } from '../dtos/inputs/vendor-products.input';
import { VendorOrdersInput } from '../dtos/inputs/vendor-orders.input';
import { VendorReviewsInput } from '../dtos/inputs/vendor-reviews.input';
import { FindOptionsWhere, Like } from 'typeorm';
import { OrderItem } from '../../orders/entities/order-item.entity';
import { OrderStatus } from '../../orders/enum/order-status.enum';

@Injectable()
export class VendorService {
  constructor(
    @InjectAppRepository(Vendor)
    private readonly vendorRepo: AppRepository<Vendor>,
    @InjectAppRepository(User)
    private readonly userRepo: AppRepository<User>,
    @InjectAppRepository(Product)
    private readonly productRepo: AppRepository<Product>,
    @InjectAppRepository(OrderItem)
    private readonly orderItemRepo: AppRepository<OrderItem>,
    @InjectAppRepository(Review)
    private readonly reviewRepo: AppRepository<Review>,
    @InjectAppRepository(AdminGroup)
    private readonly adminGroupRepo: AppRepository<AdminGroup>,
    private readonly mailService: MailService,
    private readonly notificationService: NotificationService,
  ) {}

  async findAll(pagination: PaginatorInput) {
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 10;

    return this.vendorRepo.findPaginated(
      undefined,
      { createdAt: 'DESC' },
      page,
      limit,
    );
  }

  async requestVendorStatus(
    userId: string,
    input: RequestVendorInput,
  ): Promise<Vendor> {
    const user = await this.userRepo.findOneOrFail({ where: { id: userId } });

    await this.vendorRepo.findOneAndFail({
      where: { user: { id: userId } },
    });

    const newVendor = this.vendorRepo.create({
      ...input,
      user,
      status: VendorStatus.PENDING,
    });

    return this.vendorRepo.save(newVendor);
  }

  async updateVendorStatus(
    userId: string,
    status: VendorStatus,
  ): Promise<Vendor> {
    const vendor = await this.vendorRepo.findOneOrFail({
      where: { user: { id: userId } },
      relations: { user: true },
    });

    if (vendor.status === status) {
      return vendor;
    }

    vendor.status = status;

    const userEmail = vendor.user.email as string;
    if (status === VendorStatus.VERIFIED) {
      const adminGroup = await this.adminGroupRepo.findOneByOrFail({
        scope: AdminGroupScopeEnum.PRODUCTS_AND_ORDERS,
      });
      vendor.user.adminGroup = adminGroup;

      this.mailService.sendEmailWithATemplate(
        userEmail,
        MailSubjectEnum.VENDOR_APPROVAL,
        MailTemplateEnum.VENDOR_APPROVAL,
        {
          businessName: vendor.businessName,
        },
        vendor.user.favLang,
      );

      const notificationInput: SendNotificationInput = {
        enTitle: 'Vendor Account Approved',
        arTitle: 'تم قبول حساب البائع الخاص بك',
        enBody: `Congratulations! Your vendor account for "${vendor.businessName}" has been approved.`,
        arBody: `تهانينا! تمت الموافقة على حساب البائع الخاص بك لـ "${vendor.businessName}".`,
        receiverUserIds: [vendor.user.id],
        inAppOnly: false,
        metadata: {
          notificationTarget: NotificationTargetEnum.VENDOR_REQUEST,
          notificationType: NotificationTypeEnum.VENDOR_ACCOUNT_APPROVED,
        },
      };
      await this.notificationService.SendNotification(notificationInput);
    }
    if (status === VendorStatus.REJECTED) {
      this.mailService.sendEmailWithATemplate(
        userEmail,
        MailSubjectEnum.VENDOR_REJECTION,
        MailTemplateEnum.VENDOR_REJECTION,
        {
          businessName: vendor.businessName,
        },
        vendor.user.favLang,
      );

      const notificationInput: SendNotificationInput = {
        enTitle: 'Vendor Account Rejected',
        arTitle: 'تم رفض حساب البائع الخاص بك',
        enBody: `We regret to inform you that your vendor account for "${vendor.businessName}" has been rejected.`,
        arBody: `نأسف لإبلاغك بأنه تم رفض حساب البائع الخاص بك لـ "${vendor.businessName}".`,
        receiverUserIds: [vendor.user.id],
        inAppOnly: false,
        metadata: {
          notificationTarget: NotificationTargetEnum.VENDOR_REQUEST,
          notificationType: NotificationTypeEnum.VENDOR_ACCOUNT_REJECTED,
        },
      };
      await this.notificationService.SendNotification(notificationInput);
    }

    return this.vendorRepo.save(vendor);
  }

  async findPendingVendors(): Promise<Vendor[]> {
    return this.vendorRepo.find({
      where: { status: VendorStatus.PENDING },
      order: { createdAt: 'ASC' },
    });
  }

  async vendorProducts(vendorId: string, pagination: VendorProductsInput) {
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 10;
    const name = pagination?.name;

    const where: FindOptionsWhere<Product> = {
      vendor: { id: vendorId },
    };

    if (name) {
      where.name = Like(`%${name}%`);
    }

    return this.productRepo.findPaginated(
      where,
      { createdAt: 'DESC' },
      page,
      limit,
    );
  }

  async vendorOrders(vendorId: string, pagination: VendorOrdersInput) {
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 10;
    const status = pagination?.status;

    const where: FindOptionsWhere<OrderItem> = {
      vendor: { id: vendorId },
    };

    if (status) {
      where.status = status as OrderStatus;
    }

    return this.orderItemRepo.findPaginated(
      where,
      { createdAt: 'DESC' },
      page,
      limit,
    );
  }

  async vendorReviews(vendorId: string, pagination: VendorReviewsInput) {
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 10;
    const rating = pagination?.rating;

    const where: FindOptionsWhere<Review> = {
      vendor: { id: vendorId },
    };

    if (rating) {
      where.rating = rating;
    }

    return this.reviewRepo.findPaginated(
      where,
      { createdAt: 'DESC' },
      page,
      limit,
    );
  }
}
