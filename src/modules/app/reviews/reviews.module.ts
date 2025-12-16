import { Module } from '@nestjs/common';
import { Review } from './entities/review.entity';
import { Vendor } from '../vendors/entities/vendor.entity';
import { AppDatabaseModule } from 'src/modules/core/app-database/app-database.module';
import { ReviewsService } from './services/reviews.service';
import { ReviewsResolver } from './resolvers/reviews.resolver';
import { Order } from '../orders/entities/order.entity';

@Module({
  imports: [AppDatabaseModule.forFeature([Review, Order, Vendor])],
  providers: [ReviewsResolver, ReviewsService],
})
export class ReviewsModule {}
