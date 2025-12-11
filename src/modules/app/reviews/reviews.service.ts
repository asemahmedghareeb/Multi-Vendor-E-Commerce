import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { CreateReviewInput } from './dto/create-review.input';
import { Order } from '../orders/entities/order.entity';
import { UpdateReviewInput } from './dto/update-review.input';
import { Vendor } from 'src/vendors/entities/vendor.entity';
import { PaginationInput } from 'src/common/dto/pagination.input';
import { IPaginatedType } from 'src/common/dto/paginated-output';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review) private reviewRepo: Repository<Review>,
    @InjectRepository(Order) private orderRepo: Repository<Order>,
    @InjectRepository(Vendor) private vendorRepo: Repository<Vendor>,
  ) {}

  private async updateVendorStats(vendorId: string) {
    const result = await this.reviewRepo
      .createQueryBuilder('review')
      .select('AVG(review.rating)', 'avg')
      .addSelect('COUNT(review.id)', 'count')
      .where('review.vendor = :vendorId', { vendorId })
      .getRawOne();

    const avg = result && result.avg ? parseFloat(result.avg) : 0;
    const count = result && result.count ? parseInt(result.count, 10) : 0;

    await this.vendorRepo.update(vendorId, {
      averageRating: avg,
      reviewsCount: count,
    });
  }
  async create(userId: string, input: CreateReviewInput): Promise<Review> {
    const existing = await this.reviewRepo.findOne({
      where: {
        user: { id: userId },
        vendor: { id: input.vendorId },
        order: { id: input.orderId },
      },
    });

    if (existing) throw new BadRequestException('review.ALREADY_REVIEWED');

    const order = await this.orderRepo.findOne({
      where: { id: input.orderId },
      relations: ['items', 'user'],
    });

    if (!order) throw new NotFoundException('events.order.NOT_FOUND');
    if (order.user.id !== userId)
      throw new ForbiddenException('events.common.FORBIDDEN');

    const hasBoughtFromVendor = order.items.some(
      (item) => item.vendorId === input.vendorId,
    );

    if (!hasBoughtFromVendor) {
      throw new BadRequestException('review.MUST_BUY_FIRST');
    }

    const review = this.reviewRepo.create({
      user: { id: userId },
      vendor: { id: input.vendorId },
      order: { id: input.orderId },
      rating: input.rating,
      comment: input.comment,
    });

    const savedReview = await this.reviewRepo.save(review);

    await this.updateVendorStats(savedReview.vendorId);

    return savedReview;
  }
  async findByVendor(
    vendorId: string,
    pagination: PaginationInput,
  ): Promise<IPaginatedType<Review>> {
    const { page, limit } = pagination;

    const skip = (page - 1) * limit;

    const [items, totalItems] = await this.reviewRepo.findAndCount({
      where: { vendor: { id: vendorId } },
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
      // relations: ['user'],
    });

    return {
      items,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
    };
  }
  async update(userId: string, input: UpdateReviewInput): Promise<Review> {
    const review = await this.reviewRepo.findOne({
      where: { id: input.id },
    });

    if (!review) throw new NotFoundException('events.common.NOT_FOUND');

    if (review.userId !== userId) {
      throw new ForbiddenException('events.vendor.NOT_OWNER');
    }

    if (input.rating) review.rating = input.rating;
    if (input.comment) review.comment = input.comment;

    const savedReview = await this.reviewRepo.save(review);
    await this.updateVendorStats(savedReview.vendorId);

    return savedReview;
  }

  async remove(userId: string, reviewId: string): Promise<boolean> {
    const review = await this.reviewRepo.findOne({ where: { id: reviewId } });

    if (!review) throw new NotFoundException('events.common.NOT_FOUND');

    if (review.userId !== userId) {
      throw new ForbiddenException('events.vendor.NOT_OWNER');
    }

    const vendorId = review.vendorId;
    await this.reviewRepo.remove(review);
    await this.updateVendorStats(vendorId);

    return true;
  }
}
