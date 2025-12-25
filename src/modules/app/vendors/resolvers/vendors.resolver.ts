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
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { RequestVendorInput } from '../dtos/inputs/request-vendor.input';
import { Transactional } from 'typeorm-transactional';
import { UserDataloader } from '../../auth-base/session/dataloaders/user.dataloader';
import { PaginatedVendorProducts } from '../dtos/responses/paginated-vendor-products.type';
import { PaginatedVendorOrders } from '../dtos/responses/paginated-vendor-orders.type';
import { PaginatedVendorReviews } from '../dtos/responses/paginated-vendor-reviews.type';
import { ParseUUIDPipe } from '@nestjs/common';
import { ApproveOrRejectVendorInput } from '../dtos/inputs/approveOrReject.input';
import { OrderStatus } from '../../orders/enum/order-status.enum';

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
    return this.vendorService.findAll(pagination);
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
  @Mutation(() => Boolean)
  async approveOrRejectVendor(
    @Args('input') input: ApproveOrRejectVendorInput,
  ) {
    return this.vendorService.updateVendorStatus(input.id, input.status);
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
  @Query(() => [Vendor])
  async pendingVendors() {
    return this.vendorService.findPendingVendors();
  }

  @Auth()
  @Mutation(() => Vendor)
  @Transactional()
  async vendorRequest(
    @CurrentUser() user: User,
    @Args('input') input: RequestVendorInput,
  ) {
    return this.vendorService.vendorRequest(user.id, input);
  }

  @Auth()
  @Query(() => PaginatedVendorProducts)
  async vendorProducts(
    @Args('vendorId', ParseUUIDPipe) vendorId: string,
    @Args('name', { nullable: true }) name: string,
    @Args('pagination') pagination: PaginatorInput,
  ) {
    return this.vendorService.vendorProducts(vendorId, pagination, name);
  }

  @Auth({
    roles: [UserRoleEnum.VENDOR],
  })
  @Query(() => PaginatedVendorOrders)
  async vendorOrders(
    @CurrentUser() user: User,
    @Args('pagination', { nullable: true }) pagination: PaginatorInput,
    @Args('status', {
      nullable: true,
      type: () => OrderStatus,
    })
    status?: OrderStatus,
  ) {
    return this.vendorService.vendorOrders(user, pagination, status);
  }
 
  @Auth()
  @Query(() => PaginatedVendorReviews)
  async vendorReviews(
    @Args('vendorId', { type: () => String }) vendorId: string,
    @Args('rating', { nullable: true }) rating: number,
    @Args('pagination') pagination: PaginatorInput,
  ) {
    return this.vendorService.vendorReviews(vendorId, pagination, rating);
  }
  @ResolveField(() => User)
  async user(@Parent() vendor: Vendor) {
    if (vendor.user) return vendor.user;
    return this.userDataloader.getDataloader().load(vendor.userId);
  }
}
