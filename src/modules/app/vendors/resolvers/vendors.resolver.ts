import {
  Args,
  Mutation,
  Parent,
  ResolveField,
  Resolver,
  Query,
} from '@nestjs/graphql';
import { VendorService } from '../services/vendors.service';
import { Vendor } from '../entities/vendor.entity';
// import { UserLoader } from 'src/dataLoaders/user.loader';
// import { ReviewsLoader } from 'src/dataLoaders/reviews.loader';
// import { ProductLoader } from 'src/dataLoaders/products.loader';
import { VendorPermissionActionsEnum } from '../enums/vendor-permission.enum';
import { UserRoleEnum } from 'src/common/enums/user-role.enum';
import { Auth } from 'src/common/decorators/auth.decorator';
import { User } from '../../auth-base/user/entities/user.entity';
// import { OrderItem } from '../orders/entities/order-item.entity';
import { PaginatorInput } from 'src/common/dtos/inputs/paginator.input';
import { PaginatedVendors } from '../dtos/responses/paginatedVendors';
import { VendorStatus } from '../enums/vendor-status.enum';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { RequestVendorInput } from '../dtos/inputs/request-vendor.input';
import { Transactional } from 'typeorm-transactional';

@Resolver(() => Vendor)
export class UsersResolver {
  constructor(
    private readonly vendorService: VendorService,
    // private readonly userLoader: UserLoader,
    // private readonly reviewsLoader: ReviewsLoader,
    // private readonly productLoader: ProductLoader,
    // private readonly orderItemsLoader: OrderItemsLoader,
  ) {}

  @Auth()
  @Query(() => PaginatedVendors)
  async vendors(
    @Args('pagination', { nullable: true })
    pagination: PaginatorInput,
  ) {
    return this.vendorService.findAll(pagination || { page: 1, limit: 10 });
  }
  
  @Auth({
    roles: [UserRoleEnum.ADMIN],
    permissions: [
      {
        action: VendorPermissionActionsEnum.APPROVE,
        target: Vendor.permissionsTarget,
      },
    ],
  })
  @Transactional()
  @Mutation(() => Vendor)
  async approveVendor(@Args('userId') userId: string) {
    console.log(userId);
    return this.vendorService.updateVendorStatus(userId, VendorStatus.VERIFIED);
  }

  @Auth({
    roles: [UserRoleEnum.ADMIN],
    permissions: [
      {
        action: VendorPermissionActionsEnum.APPROVE,
        target: Vendor.permissionsTarget,
      },
    ],
  })
  @Auth({ roles: [UserRoleEnum.ADMIN] })
  @Query(() => [Vendor])
  async pendingVendors() {
    return this.vendorService.findPendingVendors();
  }

  @Auth()
  @Mutation(() => Vendor)
  @Transactional()
  async requestVendorStatus(
    @CurrentUser() user: User,
    @Args('input') input: RequestVendorInput,
  ) {
    return this.vendorService.requestVendorStatus(user.id, input);
  }

  // @ResolveField(() => User)
  // async user(@Parent() vendor: Vendor) {
  //   if (vendor.user) return vendor.user;
  //   return this.userLoader.batchUsers.load(vendor.userId);
  // }

  // @ResolveField(() => [Review])
  // async reviews(@Parent() vendor: Vendor) {
  //   if (vendor.reviews) return vendor.reviews;
  //   return this.reviewsLoader.load.load(vendor.id);
  // }

  // @ResolveField(() => [OrderItem])
  // async orders(@Parent() vendor: Vendor) {
  //   if (vendor.orders) return vendor.orders;

  //   return this.orderItemsLoader.byVendorId.load(vendor.id);
  // }
}
