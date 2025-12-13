import { Injectable } from '@nestjs/common';
import { Vendor } from '../entities/vendor.entity';
import { User } from '../../auth-base/user/entities/user.entity';
// import { NotificationsService } from 'src/notifications/notification.service';
import { PaginatorInput } from 'src/common/dtos/inputs/paginator.input';
import { VendorStatus } from '../enums/vendor-status.enum';
import { RequestVendorInput } from '../dtos/inputs/request-vendor.input';
import { InjectAppRepository } from 'src/common/decorators/inject-app-repository.decorator';
import { AppRepository } from 'src/modules/core/app-database/repositories/app.repository';
import { UserRoleEnum } from 'src/common/enums/user-role.enum';

@Injectable()
export class VendorService {
  constructor(
    @InjectAppRepository(Vendor)
    private readonly vendorRepo: AppRepository<Vendor>,
    @InjectAppRepository(User)
    private readonly userRepo: AppRepository<User>,
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
    // const vendor = await this.vendorRepo.findOne({
    //   where: { user: { id: userId } },
    //   relations: ['user'],
    // });
    // if (!vendor) throw new NotFoundException('events.vendor.NOT_FOUND');

    const vendor = await this.vendorRepo.findOneOrFail({
      where: { user: { id: userId } },
      relations: ['user'],
    });

    if (vendor.status === status) {
      return vendor;
    }

    vendor.status = status;

    if (status === VendorStatus.VERIFIED) {
      // await this.notificationsService.sendVendorApproval(
      //   vendor.user.email,
      //   vendor.businessName,
      // );
    }
    if (status === VendorStatus.REJECTED) {
      // await this.notificationsService.sendVendorRejection(
      //   vendor.user.email,
      //   vendor.businessName,
      // );
    }

    return this.vendorRepo.save(vendor);
  }

  async findPendingVendors(): Promise<Vendor[]> {
    return this.vendorRepo.find({
      where: { status: VendorStatus.PENDING },
      order: { createdAt: 'ASC' },
    });
  }
}
