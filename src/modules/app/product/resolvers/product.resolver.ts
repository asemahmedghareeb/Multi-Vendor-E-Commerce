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
import { NullablePaginatorArgsInput, PaginatorInput } from 'src/common/dtos/inputs/paginator.input';
import { User } from '../../auth-base/user/entities/user.entity';
import { Category } from '../../categories/entities/category.entity';
import { Vendor } from '../../vendors/entities/vendor.entity';
import { CategoryLoader } from '../dataloaders/category.dataloader';
import { VendorDataloader } from '../dataloaders/vendor.dataloader';
import { CreateProductInput } from '../dto/inputs/create-product.input';
import { GetProductsFilterInput } from '../dto/inputs/pagination.input';
import { UpdateProductInput } from '../dto/inputs/Update-product-Input';
import { ProductPaginated } from '../dto/responses/paginated-products';
import { Product } from '../entities/product.entity';
import { ProductService } from '../services/product.service';
import { PresignedUrlService } from 'src/modules/core/media/services/presigned-url.service';
import { GeneratePresignedUrlInput } from 'src/modules/core/media/dtos/inputs/generate-presigned-url.input';
import { FileUseCaseEnum } from 'src/modules/core/media/enums/file-use-case.enum';
import { InjectAppRepository } from 'src/common/decorators/inject-app-repository.decorator';
import { AppRepository } from 'src/modules/core/app-database/repositories/app.repository';
import { File } from 'src/modules/core/media/entities/file.entity';
import { PresignedUrlPayload } from '../dto/responses/presigned-url-payload';
import { ParseUUIDPipe } from '@nestjs/common';
import { FilesPaginated } from 'src/modules/core/media/dtos/responses/file-paginated.responese';

@Resolver(() => Product)
export class ProductsResolver {
  constructor(
    private readonly productService: ProductService,
    private readonly vendorDataLoader: VendorDataloader,
    private readonly categoryLoader: CategoryLoader,
    private readonly presignedUrlService: PresignedUrlService,
    @InjectAppRepository(File)
    private readonly fileRepository: AppRepository<File>,
  ) {}

  @Auth({
    roles: [UserRoleEnum.VENDOR],
  })
  @Mutation(() => PresignedUrlPayload)
  @Transactional()
  async generateProductImageUploadUrl(
    @Args('input') input: GeneratePresignedUrlInput,
  ): Promise<PresignedUrlPayload> {
    const { presignedUrl, file } =
      await this.presignedUrlService.getUploadPresignedUrl({
        ...input,
        fileUseCase: FileUseCaseEnum.PRODUCT_IMAGE,
      });

    return { presignedUrl, fileId: file.id };
  }

  // @Auth({
  //   roles: [UserRoleEnum.VENDOR],
  // })
  // @Mutation(() => Product)
  // @Transactional()
  // async assignProductImage(
  //   @Args('productId', { type: () => ID }) productId: string,
  //   @Args('fileId', { type: () => ID }) fileId: string,
  //   @CurrentUser() user: User,
  // ) {
  //   return this.productService.assignImage(user, productId, fileId);
  // }

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
    @Args('pagination', { nullable: true })
    pagination: PaginatorInput,
  ) {
    return this.productService.getUserFeed(user, pagination);
  }

  // @Auth()
  @Query(() => ProductPaginated)
  async products(
    @Args('pagination', { nullable: true }) filter: GetProductsFilterInput,
  ) {
    return this.productService.findAll(filter);
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

  // @ResolveField(() => [String], { nullable: 'itemsAndList' })
  // async images(@Parent() product: Product) {
  //   if (!product.images?.length) {
  //     return [];
  //   }

  //   // This is not the most optimal solution, as it can lead to N+1 problems.
  //   // A better approach would be to use a DataLoader to batch fetch files.
  //   // However, for simplicity, we are fetching them one by one here.
  //   const files = await this.fileRepository.findByIds(product.images);

  //   if (!files.length) return [];

  //   const urls = await Promise.all(
  //     files.map((file) =>
  //       this.presignedUrlService.getDownloadPresignedUrl(file),
  //     ),
  //   );

  //   return urls;
  // }

  @Auth()
  @Query(() => FilesPaginated)
  async productImages(
    @CurrentUser() user: User,
    @Args('productId', ParseUUIDPipe) productId: string,
    @Args('input', { nullable: true }) input: PaginatorInput,
  ): Promise<any> {
    return this.productService.productImages(
      user,
      productId,
      input,
    );
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
