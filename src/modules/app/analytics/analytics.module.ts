import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OrderItem } from '../orders/entities/order-item.entity';
import { Review } from '../reviews/entities/review.entity';
import { Vendor } from '../vendors/entities/vendor.entity';
import { Product } from '../product/entities/product.entity';
import { AnalyticsResolver } from './resolvers/analytics.resolver';
import { AnalyticsService } from './services/analytics.service';


@Module({
  imports: [TypeOrmModule.forFeature([OrderItem, Review, Vendor, Product])],
  providers: [AnalyticsService, AnalyticsResolver],
})
export class AnalyticsModule {}
