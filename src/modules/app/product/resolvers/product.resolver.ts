import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { Transactional } from 'typeorm-transactional';
import { Auth } from 'src/common/decorators/auth.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { DefaultPermissionActionsEnum } from 'src/common/enums/default-permissions.enum';
import { UserRoleEnum } from 'src/common/enums/user-role.enum';
import { NullablePaginatorArgsInput } from 'src/common/dtos/inputs/paginator.input';
import { User } from '../../auth-base/user/entities/user.entity';
import { Category } from '../../categories/entities/category.entity';
import { Vendor } from '../../vendors/entities/vendor.entity';
import { CategoryLoader } from '../dataloaders/category.dataloader';
import { VendorDataloader } from '../dataloaders/vendor.dataloader';
import { CreateProductInput } from '../dto/inputs/create-product.input';
import { GetProductsFilterInput } from '../dto/inputs/pagination.input';
import { UpdateProductInput } from '../dto/inputs/Update-product-Input';
import {
  ProductCursorPaginated,
  ProductPaginated,
} from '../dto/responses/paginated-products';
import { GetProductsCursorFilterInput } from '../dto/inputs/cursor-pagination.input';
import { Product } from '../entities/product.entity';
import { ProductService } from '../services/product.service';
import { PresignedUrlService } from 'src/modules/core/media/services/presigned-url.service';
import { InjectAppRepository } from 'src/common/decorators/inject-app-repository.decorator';
import { AppRepository } from 'src/modules/core/app-database/repositories/app.repository';
import { File } from 'src/modules/core/media/entities/file.entity';
import { ParseUUIDPipe } from '@nestjs/common';
import { FilesPaginated } from 'src/modules/core/media/dtos/responses/file-paginated.responese';

@Resolver(() => Product)
export class ProductsResolver {
  constructor(
    private readonly productService: ProductService,
    private readonly vendorDataLoader: VendorDataloader,
    private readonly categoryLoader: CategoryLoader,
  ) {}

  @Auth({
    roles: [UserRoleEnum.ADMIN, UserRoleEnum.VENDOR],
    permissions: [
      {
        action: DefaultPermissionActionsEnum.CREATE,
        target: Product.permissionsTarget,
      },
    ],
  })
  @Mutation(() => Product)
  @Transactional()
  async createProduct(
    @Args('createProductInput') createProductInput: CreateProductInput,
    @CurrentUser() user: User,
  ): Promise<Product> {
    return this.productService.create(user.id, createProductInput);
  }

  @Query(() => ProductPaginated, { name: 'feed' })
  @Auth()
  async userFeed(
    @CurrentUser() user: User,
    @Args({ nullable: true })
    pagination: NullablePaginatorArgsInput,
  ) {
    return this.productService.getUserFeed(user, pagination.paginate);
  }

  // @Auth()
  @Query(() => ProductPaginated)
  async products(
    @Args('pagination', { nullable: true }) filter: GetProductsFilterInput,
  ) {
    return this.productService.findAll(filter);
  }

  @Query(() => ProductCursorPaginated)
  async productsCursor(
    @Args('pagination', { nullable: true })
    filter: GetProductsCursorFilterInput,
  ) {
    return this.productService.findAllCursor(filter);
  }

  @Auth()
  @Query(() => Product)
  async product(@Args('id', ParseUUIDPipe) id: string) {
    return this.productService.findOne(id);
  }

  @Auth({
    roles: [UserRoleEnum.ADMIN, UserRoleEnum.VENDOR],
    permissions: [
      {
        action: DefaultPermissionActionsEnum.UPDATE,
        target: Product.permissionsTarget,
      },
    ],
  })
  @Mutation(() => Product)
  @Transactional()
  async updateProduct(
    @Args('updateProductInput') updateProductInput: UpdateProductInput,
    @CurrentUser() user: User,
  ) {
    return this.productService.update(user, updateProductInput);
  }

  @Auth({
    roles: [UserRoleEnum.ADMIN, UserRoleEnum.VENDOR],
    permissions: [
      {
        action: DefaultPermissionActionsEnum.DELETE,
        target: Product.permissionsTarget,
      },
    ],
  })
  @Mutation(() => Boolean)
  @Transactional()
  async removeProduct(
    @Args('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    return this.productService.remove(user, id);
  }

  @Auth()
  @Query(() => FilesPaginated)
  async productImages(
    @CurrentUser() user: User,
    @Args('productId', ParseUUIDPipe) productId: string,
    @Args({ nullable: true }) input: NullablePaginatorArgsInput,
  ): Promise<any> {
    return this.productService.productImages(user, productId, input.paginate);
  }

  @ResolveField(() => Vendor)
  async vendor(@Parent() product: Product) {
    if (product.vendor) return product.vendor;
    return this.vendorDataLoader.getDataloader().load(product.vendorId);
  }

  @ResolveField(() => Category)
  async category(@Parent() product: Product) {
    if (product.category) return product.category;
    return this.categoryLoader.getDataloader().load(product.categoryId);
  }
}
