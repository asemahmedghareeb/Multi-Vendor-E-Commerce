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
import { VendorPermissionActionsEnum } from '../enums/vendor-permission.enum';
import { UserRoleEnum } from 'src/common/enums/user-role.enum';
import { Auth } from 'src/common/decorators/auth.decorator';
import { User } from '../../auth-base/user/entities/user.entity';
import { PaginatorInput } from 'src/common/dtos/inputs/paginator.input';
import { PaginatedVendors } from '../dtos/responses/paginatedVendors';
import { VendorStatus } from '../enums/vendor-status.enum';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { RequestVendorInput } from '../dtos/inputs/request-vendor.input';
import { Transactional } from 'typeorm-transactional';
import { UserDataloader } from '../../auth-base/session/dataloaders/user.dataloader';
import { PaginatedVendorProducts } from '../dtos/responses/paginated-vendor-products.type';
import { VendorProductsInput } from '../dtos/inputs/vendor-products.input';
import { PaginatedVendorOrders } from '../dtos/responses/paginated-vendor-orders.type';
import { VendorOrdersInput } from '../dtos/inputs/vendor-orders.input';
import { PaginatedVendorReviews } from '../dtos/responses/paginated-vendor-reviews.type';
import { VendorReviewsInput } from '../dtos/inputs/vendor-reviews.input';
import { ParseUUIDPipe } from '@nestjs/common';
import { parse } from 'path';

@Resolver(() => Vendor)
export class VendorsResolver {
  constructor(
    private readonly vendorService: VendorService,
    private readonly userDataloader: UserDataloader,
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
  async approveVendor(@Args('userId', ParseUUIDPipe) userId: string) {
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
  @Auth({
    roles: [UserRoleEnum.ADMIN],
    permissions: [
      {
        action: VendorPermissionActionsEnum.READ,
        target: Vendor.permissionsTarget,
      },
    ],
  })
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

  @Auth()
  @Query(() => PaginatedVendorProducts)
  async vendorProducts(
    @Args('vendorId', ParseUUIDPipe) vendorId: string,
    @Args('pagination') pagination: VendorProductsInput,
  ) {
    return this.vendorService.vendorProducts(vendorId, pagination);
  }

  @Auth({ roles: [UserRoleEnum.ADMIN] })
  @Query(() => PaginatedVendorOrders)
  async vendorOrders(
    @Args('vendorId', ParseUUIDPipe) vendorId: string,
    @Args('pagination', { nullable: true }) pagination: VendorOrdersInput,
  ) {
    return this.vendorService.vendorOrders(vendorId, pagination);
  }

  @Auth()
  @Query(() => PaginatedVendorReviews)
  async vendorReviews(
    @Args('vendorId', { type: () => String }) vendorId: string,
    @Args('pagination') pagination: VendorReviewsInput,
  ) {
    return this.vendorService.vendorReviews(vendorId, pagination);
  }
  @ResolveField(() => User)
  async user(@Parent() vendor: Vendor) {
    if (vendor.user) return vendor.user;
    return this.userDataloader.getDataloader().load(vendor.userId);
  }
}
