import { Injectable } from '@nestjs/common';
import { Vendor } from '../entities/vendor.entity';
import { User } from '../../auth-base/user/entities/user.entity';
import { PaginatorInput } from 'src/common/dtos/inputs/paginator.input';
import { VendorStatus } from '../enums/vendor-status.enum';
import { RequestVendorInput } from '../dtos/inputs/request-vendor.input';
import { InjectAppRepository } from 'src/common/decorators/inject-app-repository.decorator';
import { AppRepository } from 'src/modules/core/app-database/repositories/app.repository';
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
import { UserRoleEnum } from 'src/common/enums/user-role.enum';
import { AppHttpException } from 'src/common/exceptions/app-http.exception';
import { ErrorCodeEnum } from 'src/common/enums/error-code.enum';

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
      where: { userId },
    });

    const newVendor = this.vendorRepo.create({
      ...input,
      user,
      status: VendorStatus.PENDING,
    });

    const savedVendor = await this.vendorRepo.save(newVendor);

    user.vendorId = savedVendor.id;
    user.vendorProfile = savedVendor;
    await this.userRepo.save(user);

    return savedVendor;
  }

  async updateVendorStatus(
    userId: string,
    status: VendorStatus,
  ): Promise<Boolean> {
    const vendor = await this.vendorRepo.findOneOrFail({
      where: { userId },
      relations: { user: true },
    });

    if (vendor.status === status) {
      throw new AppHttpException(ErrorCodeEnum.BAD_REQUEST_EXCEPTION);
    }

    vendor.status = status;

    const userEmail = vendor.user.email as string;
    if (status === VendorStatus.VERIFIED) {
      vendor.user.role = UserRoleEnum.VENDOR;
      await this.userRepo.save(vendor.user);

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

    return true;
  }

  async findPendingVendors(): Promise<Vendor[]> {
    //todo pagination
    return this.vendorRepo.find({
      where: { status: VendorStatus.PENDING },
      order: { createdAt: 'ASC' },
    });
  }

  async vendorProducts(vendorId: string, pagination: VendorProductsInput) {
    const { name, limit, page } = pagination;
    const where: FindOptionsWhere<Product> = {
      vendorId,
    };

    console.log(
      await this.productRepo.findPaginated(
        where,
        { createdAt: 'DESC' },
        page,
        limit,
      ),
    );

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
    const { page, limit, status } = pagination;

    const where: FindOptionsWhere<OrderItem> = {
      vendorId,
    };

    if (status) {
      where.status = status as OrderStatus;
    }

    return this.orderItemRepo.findPaginated(
      where,
      { createdAt: 'DESC' },
      page,
      limit,
      {
        order: true,
        product: true,
      },
    );
  }

  async vendorReviews(vendorId: string, pagination: VendorReviewsInput) {
    const { page, limit, rating } = pagination;
    const where: FindOptionsWhere<Review> = {
      vendorId,
    };

    if (rating) {
      where.rating = rating;
    }

    return this.reviewRepo.findPaginated(
      where,
      { createdAt: 'DESC' },
      page,
      limit,
      {
        user: true,
      },
    );
  }
}
