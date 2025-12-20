import { Module } from '@nestjs/common';
import { OrderItem } from '../orders/entities/order-item.entity';
import { Review } from '../reviews/entities/review.entity';
import { Vendor } from '../vendors/entities/vendor.entity';
import { Product } from '../product/entities/product.entity';
import { AnalyticsResolver } from './resolvers/analytics.resolver';
import { AnalyticsService } from './services/analytics.service';
import { AppDatabaseModule } from 'src/modules/core/app-database/app-database.module';


@Module({
  imports: [AppDatabaseModule.forFeature([OrderItem, Review, Vendor, Product])],
  providers: [AnalyticsService, AnalyticsResolver],
})
export class AnalyticsModule {}
