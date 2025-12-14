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
import { NotificationPusherService } from 'src/modules/core/notification-pusher/services/notification-pusher.service';
import { Session } from '../../auth-base/session/entities/session.entity';

@Injectable()
export class VendorService {
  constructor(
    @InjectAppRepository(Vendor)
    private readonly vendorRepo: AppRepository<Vendor>,
    @InjectAppRepository(User)
    private readonly userRepo: AppRepository<User>,
    @InjectAppRepository(AdminGroup)
    private readonly adminGroupRepo: AppRepository<AdminGroup>,
    @InjectAppRepository(Session)
    private readonly sessionRepo: AppRepository<Session>,
    private readonly mailService: MailService,
    private readonly notificationPusherService: NotificationPusherService,
  ) {}

  async findAll(pagination: PaginatorInput) {
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 10;
    const skip = (page - 1) * limit;

    const [items, totalItems] = await this.vendorRepo.findAndCount({
      skip,
      take: limit,
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });

    return {
      items,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
    };
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
      relations: ['user'],
    });

    if (vendor.status === status) {
      return vendor;
    }

    vendor.status = status;

    const userEmail = vendor.user.email as string;
    if (status === VendorStatus.VERIFIED) {
      const adminGroup = await this.adminGroupRepo.findOneByOrFail({
        scope: AdminGroupScopeEnum.PRODUCT,
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
    }

    return this.vendorRepo.save(vendor);
  }

  async findPendingVendors(): Promise<Vendor[]> {
    return this.vendorRepo.find({
      where: { status: VendorStatus.PENDING },
      order: { createdAt: 'ASC' },
      relations: ['user'],
    });
  }
}
