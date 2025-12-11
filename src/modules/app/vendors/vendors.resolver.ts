import { ProductsService } from './../products/products.service';
import { OrderItemsLoader } from './../dataLoaders/orderItem.loader';
import {
  Args,
  Mutation,
  Parent,
  ResolveField,
  Resolver,
  Query,
} from '@nestjs/graphql';
import { VendorService } from './vendors.service';
import { UseGuards } from '@nestjs/common';
import { Vendor, VendorStatus } from './entities/vendor.entity';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { UserLoader } from 'src/dataLoaders/user.loader';
import { User } from 'src/users/entities/user.entity';
import { Review } from 'src/reviews/entities/review.entity';
import { ReviewsLoader } from 'src/dataLoaders/reviews.loader';
import { ProductLoader } from 'src/dataLoaders/products.loader';
import { OrderItem } from 'src/orders/entities/order-item.entity';
import { genericPaginated } from 'src/common/dto/paginated-output';
import { PaginationInput } from 'src/common/dto/pagination.input';
import { paginatedProduct } from 'src/products/products.resolver';
import { UserRoleEnum } from 'src/common/enums/user-role.enum';
import { Auth } from 'src/common/decorators/auth.decorator';
const paginatedVendors = genericPaginated(Vendor);

@Resolver(() => Vendor)
export class UsersResolver {
  constructor(
    private readonly vendorService: VendorService,
    private readonly userLoader: UserLoader,
    private readonly reviewsLoader: ReviewsLoader,
    private readonly productLoader: ProductLoader,
    private readonly orderItemsLoader: OrderItemsLoader,
    private readonly productsService: ProductsService,
  ) {}

  @Query(() => paginatedVendors)
  async vendors(
    @Args('pagination', { nullable: true }) pagination?: PaginationInput,
  ) {
    return this.vendorService.findAll(pagination || { page: 1, limit: 10 });
  }

  @Auth({ roles: [UserRoleEnum.SUPER_ADMIN] })
  @Mutation(() => Vendor)
  async approveVendor(@Args('userId') userId: string) {
    return this.vendorService.updateVendorStatus(userId, VendorStatus.VERIFIED);
  }

  @Auth({ roles: [UserRoleEnum.SUPER_ADMIN] })
  @Query(() => [Vendor])
  async pendingVendors() {
    return this.vendorService.findPendingVendors();
  }

  @ResolveField(() => User)
  async user(@Parent() vendor: Vendor) {
    if (vendor.user) return vendor.user;
    return this.userLoader.batchUsers.load(vendor.userId);
  }

  @ResolveField(() => [Review])
  async reviews(@Parent() vendor: Vendor) {
    if (vendor.reviews) return vendor.reviews;
    return this.reviewsLoader.load.load(vendor.id);
  }

  // @ResolveField(() => paginatedProduct)
  // async products(
  //   @Parent() vendor: Vendor,
  //   @Args('pagination', { nullable: true }) pagination?: PaginationInput,
  // ) {
  //   const input = pagination || { page: 1, limit: 10 };

  //   return this.productsService.findAllByVendor(vendor.id, input);
  // }

  @ResolveField(() => [OrderItem])
  async orders(@Parent() vendor: Vendor) {
    if (vendor.orders) return vendor.orders;

    return this.orderItemsLoader.byVendorId.load(vendor.id);
  }
}
