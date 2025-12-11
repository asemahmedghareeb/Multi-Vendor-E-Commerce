import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vendor } from './entities/vendor.entity';
import { VendorStatus } from './entities/vendor.entity';

import { IPaginatedType } from 'src/common/dto/paginated-output';
import { PaginationInput } from 'src/common/dto/pagination.input';
import { NotificationsService } from 'src/notifications/notification.service';

@Injectable()
export class VendorService {
  constructor(
    @InjectRepository(Vendor)
    private readonly vendorRepo: Repository<Vendor>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async findAll(pagination: PaginationInput): Promise<IPaginatedType<Vendor>> {
    const { page, limit } = pagination;
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

  async updateVendorStatus(
    userId: string,
    status: VendorStatus,
  ): Promise<Vendor> {
    const vendor = await this.vendorRepo.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });
    if (!vendor)
      throw new NotFoundException('events.vendor.NOT_FOUND');

    vendor.status = status;

    if (status === VendorStatus.VERIFIED) {
      await this.notificationsService.sendVendorApproval(
        vendor.user.email,
        vendor.businessName,
      );
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
