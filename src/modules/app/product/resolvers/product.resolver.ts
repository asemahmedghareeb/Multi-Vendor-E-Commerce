import { Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { Mutation, Args } from '@nestjs/graphql';
import { Product } from '../entities/product.entity';
import { ProductService } from '../services/product.service';
import { Auth } from 'src/common/decorators/auth.decorator';
import { CreateProductInput } from '../dto/inputs/create-product.input';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { PaginatorInput } from 'src/common/dtos/inputs/paginator.input';
import { GetProductsFilterInput } from '../dto/inputs/product-filter.input';
import { UpdateProductInput } from '../dto/inputs/Update-product-Input';
import { ProductPaginated } from '../dto/responses/paginated-products';
import { Vendor } from '../../vendors/entities/vendor.entity';
import { Category } from '../../categories/entities/category.entity';
import { User } from '../../auth-base/user/entities/user.entity';
import { DefaultPermissionActionsEnum } from 'src/common/enums/default-permissions.enum';
import { Transactional } from 'typeorm-transactional';
import { VendorDataloader } from '../dataloaders/vendor.dataloader';
import { CategoryLoader } from '../dataloaders/category.dataloader';

@Resolver(() => Product)
export class ProductsResolver {
  constructor(
    private readonly productService: ProductService,
    // private readonly guardHelperService: GuardHelperService,
    private readonly vendorDataLoader: VendorDataloader,
    private readonly categoryLoader: CategoryLoader,
  ) {}

  @Auth({
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
    @Args('pagination', { nullable: true })
    pagination?: PaginatorInput,
  ) {
    const input = pagination || { page: 1, limit: 10 };
    return this.productService.getUserFeed(user, input);
  }

  @Auth()
  @Query(() => ProductPaginated)
  async products(
    @Args('filter', { nullable: true }) filter?: GetProductsFilterInput,
  ) {
    const input = filter || { page: 1, limit: 10 };
    return this.productService.findAll(input);
  }

  @Auth()
  @Query(() => Product)
  async product(@Args('id', { type: () => String }) id: string) {
    return this.productService.findOne(id);
  }

  @Auth({
    permissions: [
      {
        action: DefaultPermissionActionsEnum.UPDATE,
        target: Product.permissionsTarget,
      },
    ],
  })
  @Mutation(() => Product)
  @Auth()
  @Transactional()
  async updateProduct(
    @Args('updateProductInput') updateProductInput: UpdateProductInput,
    @CurrentUser() user: User,
  ) {
    return this.productService.update(user.id, updateProductInput);
  }

  @Auth({
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
    @Args('id', { type: () => String }) id: string,
    @CurrentUser() user: User,
  ) {
    return this.productService.remove(user.id, id);
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
