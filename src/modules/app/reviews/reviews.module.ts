import { Module } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { ReviewsResolver } from './reviews.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from './entities/review.entity';
import { Order } from '../orders/entities/order.entity';
import { Vendor } from 'src/vendors/entities/vendor.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Review, Order, Vendor])],
  providers: [ReviewsResolver, ReviewsService],
})
export class ReviewsModule {}
