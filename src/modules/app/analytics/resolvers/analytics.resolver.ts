import { Resolver, Query, Args } from '@nestjs/graphql';
import { Product } from '../../product/entities/product.entity';
import { Vendor } from '../../vendors/entities/vendor.entity';
import { GetAnalyticsInput } from '../dtos/get-analytics.input';
import { AnalyticsService } from '../services/analytics.service';


@Resolver()
export class AnalyticsResolver {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Query(() => [Product], { name: 'topSellingProducts' })
  async getTopProducts(
    @Args('input', { nullable: true }) input?: GetAnalyticsInput,
  ) {
    return this.analyticsService.getTopSellingProducts(
      input || new GetAnalyticsInput(),
    );
  }

  @Query(() => [Vendor], { name: 'topPopularVendors' })
  async getTopVendors(
    @Args('input', { nullable: true }) input?: GetAnalyticsInput,
  ) {
    return this.analyticsService.getTopVendors(
      input || new GetAnalyticsInput(),
    );
  }
}
