import { Injectable } from '@nestjs/common';
import { Review } from '../entities/review.entity';
import { Order } from '../../orders/entities/order.entity';
import { Vendor } from '../../vendors/entities/vendor.entity';
import { InjectAppRepository } from 'src/common/decorators/inject-app-repository.decorator';
import { AppRepository } from 'src/modules/core/app-database/repositories/app.repository';
import { CreateReviewInput } from '../dto/inputs/create-review.input';
import { UpdateReviewInput } from '../dto/inputs/update-review.input';
import { ErrorCodeEnum } from 'src/common/enums/error-code.enum';
import { AppHttpException } from 'src/common/exceptions/app-http.exception';
import { OrderStatus } from '../../orders/enum/order-status.enum';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectAppRepository(Review) private reviewRepo: AppRepository<Review>,
    @InjectAppRepository(Order) private orderRepo: AppRepository<Order>,
    @InjectAppRepository(Vendor) private vendorRepo: AppRepository<Vendor>,
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
    this.reviewRepo.findOneAndFail({
      where: {
        userId,
        vendorId: input.vendorId,
        orderId: input.orderId,
      },
    });

    const order = await this.orderRepo.findOneOrFail({
      where: { id: input.orderId },
      relations: ['items', 'user'],
    });

    // if (order.user.id !== userId)
    //   throw new AppHttpException(ErrorCodeEnum.FORBIDDEN);

    if (order.user.id !== userId && order.status !== OrderStatus.DELIVERED)
      throw new AppHttpException(ErrorCodeEnum.FORBIDDEN);

    const hasBoughtFromVendor = order.items.some(
      (item) =>
        item.vendorId === input.vendorId &&
        item.status === OrderStatus.DELIVERED,
    );

    if (!hasBoughtFromVendor) {
      throw new AppHttpException(ErrorCodeEnum.FORBIDDEN);
    }

    const review = this.reviewRepo.create({
      userId,
      vendorId: input.vendorId,
      orderId: input.orderId,
      rating: input.rating,
      comment: input.comment,
    });

    const savedReview = await this.reviewRepo.save(review);

    await this.updateVendorStats(savedReview.vendorId);

    return savedReview;
  }

  async update(userId: string, input: UpdateReviewInput): Promise<Review> {
    const review = await this.reviewRepo.findOneOrFail({
      where: { id: input.id },
    });

    if (review.userId !== userId) {
      throw new AppHttpException(ErrorCodeEnum.FORBIDDEN);
    }

    if (input.rating) review.rating = input.rating;
    if (input.comment) review.comment = input.comment;

    const savedReview = await this.reviewRepo.save(review);
    await this.updateVendorStats(savedReview.vendorId);

    return savedReview;
  }

  async remove(userId: string, reviewId: string): Promise<boolean> {
    const review = await this.reviewRepo.findOneOrFail({
      where: { id: reviewId },
    });

    if (review.userId !== userId) {
      throw new AppHttpException(ErrorCodeEnum.FORBIDDEN);
    }

    const vendorId = review.vendorId;
    await this.reviewRepo.remove(review);
    await this.updateVendorStats(vendorId);

    return true;
  }
}
