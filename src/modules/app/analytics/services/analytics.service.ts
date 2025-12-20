import { Injectable } from '@nestjs/common';
import { OrderItem } from '../../orders/entities/order-item.entity';
import { Product } from '../../product/entities/product.entity';
import { Review } from '../../reviews/entities/review.entity';
import { Vendor } from '../../vendors/entities/vendor.entity';
import { GetAnalyticsInput } from '../dtos/get-analytics.input';
import { InjectAppRepository } from 'src/common/decorators/inject-app-repository.decorator';
import { AppRepository } from 'src/modules/core/app-database/repositories/app.repository';
import {
  Between,
  In,
  LessThanOrEqual,
  MoreThanOrEqual,
} from 'typeorm';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectAppRepository(OrderItem)
    private orderItemRepo: AppRepository<OrderItem>,
    @InjectAppRepository(Review) private reviewRepo: AppRepository<Review>,
    @InjectAppRepository(Vendor) private vendorRepo: AppRepository<Vendor>,
    @InjectAppRepository(Product) private productRepo: AppRepository<Product>,
  ) {}

  async getTopSellingProducts(input: GetAnalyticsInput): Promise<Product[]> {
    const qb = this.orderItemRepo.createQueryBuilder('oi');

    qb.select('oi.productId', 'productId')
      .addSelect('SUM(oi.quantity)', 'totalSold')
      .where('oi.productId IS NOT NULL')
      .groupBy('oi.productId')
      .orderBy('"totalSold"', 'DESC')
      .limit(input.limit);

    const dateFilters: any = {};
    if (input.startDate && input.endDate) {
      dateFilters.createdAt = Between(input.startDate, input.endDate);
    } else if (input.startDate) {
      dateFilters.createdAt = MoreThanOrEqual(input.startDate);
    } else if (input.endDate) {
      dateFilters.createdAt = LessThanOrEqual(input.endDate);
    }

    if (input.startDate) {
      qb.andWhere('oi.createdAt >= :startDate', { startDate: input.startDate });
    }
    if (input.endDate) {
      qb.andWhere('oi.createdAt <= :endDate', { endDate: input.endDate });
    }

    const rawResults = await qb.getRawMany();

    if (rawResults.length === 0) return [];

    const productIds = rawResults.map((row) => row.productId);

    const products = await this.productRepo.find({
      where: {
        id: In(productIds),
      },
    });

    return productIds
      .map((id) => products.find((p) => p.id === id))
      .filter((p): p is Product => p !== undefined);
  }

  async getTopVendors(input: GetAnalyticsInput): Promise<Vendor[]> {
    if (!input.startDate && !input.endDate) {
      const qb = this.vendorRepo.createQueryBuilder('vendor');
      qb.leftJoinAndSelect('vendor.user', 'user')
        .addSelect('(vendor.totalSales + vendor.averageRating)', 'score')
        .orderBy('score', 'DESC')
        .take(input.limit);

      return qb.getMany();
    }

    const salesQb = this.orderItemRepo.createQueryBuilder('oi');
    salesQb
      .select('oi.vendor_id', 'vendorId')
      .addSelect('SUM(oi.quantity)', 'totalSales')
      .groupBy('oi.vendor_id');

    if (input.startDate) {
      salesQb.andWhere('oi.createdAt >= :startDate', {
        startDate: input.startDate,
      });
    }
    if (input.endDate) {
      salesQb.andWhere('oi.createdAt <= :endDate', {
        endDate: input.endDate,
      });
    }

    const salesData = await salesQb.getRawMany();

    const reviewsQb = this.reviewRepo.createQueryBuilder('r');
    reviewsQb
      .select('r.vendor_id', 'vendorId')
      .addSelect('AVG(r.rating)', 'avgRating')
      .groupBy('r.vendor_id');

    if (input.startDate) {
      reviewsQb.andWhere('r.createdAt >= :startDate', {
        startDate: input.startDate,
      });
    }
    if (input.endDate) {
      reviewsQb.andWhere('r.createdAt <= :endDate', {
        endDate: input.endDate,
      });
    }

    const reviewData = await reviewsQb.getRawMany();

    const scores = new Map<string, number>();

    salesData.forEach((row) => {
      const score = parseInt(row.totalSales, 10);
      scores.set(row.vendorId, (scores.get(row.vendorId) || 0) + score);
    });

    reviewData.forEach((row) => {
      const rating = parseFloat(row.avgRating);
      scores.set(row.vendorId, (scores.get(row.vendorId) || 0) + rating);
    });

    const sortedVendorIds = [...scores.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, input.limit)
      .map((entry) => entry[0]);

    if (sortedVendorIds.length === 0) return [];

    const vendors = await this.vendorRepo.find({
      where: {
        id: In(sortedVendorIds),
      },
      relations: ['user'],
    });

    return sortedVendorIds
      .map((id) => vendors.find((v) => v.id === id))
      .filter((v): v is Vendor => v !== undefined);
  }
}
