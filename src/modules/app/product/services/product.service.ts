import { Injectable } from '@nestjs/common';
import {
  Between,
  FindOptionsWhere,
  ILike,
  In,
  LessThanOrEqual,
  MoreThanOrEqual,
} from 'typeorm';
import { InjectAppRepository } from 'src/common/decorators/inject-app-repository.decorator';
import { AppRepository } from 'src/modules/core/app-database/repositories/app.repository';
import { Product } from '../entities/product.entity';
import { UpdateProductInput } from '../dto/inputs/Update-product-Input';
import { CreateProductInput } from '../dto/inputs/create-product.input';
import { PaginatorInput } from 'src/common/dtos/inputs/paginator.input';
import { User } from '../../auth-base/user/entities/user.entity';
import { Vendor } from '../../vendors/entities/vendor.entity';
import { Category } from '../../categories/entities/category.entity';
import { Follow } from '../../follow/entities/follow.entity';
import { GetProductsFilterInput } from '../dto/inputs/product-filter.input';
import { AppHttpException } from 'src/common/exceptions/app-http.exception';
import { ErrorCodeEnum } from 'src/common/enums/error-code.enum';
import { VendorStatus } from '../../vendors/enums/vendor-status.enum';
import { UserRoleEnum } from 'src/common/enums/user-role.enum';
import { File } from 'src/modules/core/media/entities/file.entity';
@Injectable()
export class ProductService {
  constructor(
    @InjectAppRepository(Product)
    private readonly productRepo: AppRepository<Product>,
    @InjectAppRepository(Vendor)
    private readonly vendorRepo: AppRepository<Vendor>,
    @InjectAppRepository(Category)
    private readonly categoryRepo: AppRepository<Category>,
    @InjectAppRepository(Follow)
    private readonly followRepo: AppRepository<Follow>,
    @InjectAppRepository(File)
    private readonly fileRepo: AppRepository<File>,
  ) {}

  // async assignImage(
  //   user: User,
  //   productId: string,
  //   fileId: string,
  // ): Promise<Product> {
  //     const product = await this.productRepo.findOneOrFail({
  //       where: { id: productId },
  //       relations: { vendor: true },
  //     });

  //     await this.checkOwnership(product, user);

  //     const file = await this.fileRepo.findOneOrFail({
  //       where: { id: fileId },
  //     });

  //     if (file.hasReference) {
  //       throw new AppHttpException(ErrorCodeEnum.FILE_ALREADY_IN_USE);
  //     }

  //     product.images = [...(product.images || []), file.id];
  //     file.hasReference = true;

  //     await this.productRepo.save(product);
  //     await this.fileRepo.save(file);

  //     return product;

  // }



  async create(userId: string, input: CreateProductInput): Promise<Product> {
    const vendor = await this.vendorRepo.findOneOrFail(
      {
        where: { user: { id: userId } },
      },
      ErrorCodeEnum.VENDOR_NOT_FOUND,
    );

    if (vendor.status !== VendorStatus.VERIFIED)
      throw new AppHttpException(ErrorCodeEnum.FORBIDDEN);

    const category = await this.categoryRepo.findOneOrFail(
      {
        where: { id: input.categoryId!.toString() },
      },
      ErrorCodeEnum.CATEGORY_DOES_NOT_EXIST,
    );

    await this.productRepo.findOneAndFail(
      {
        where: { name: input.name, vendor: { id: vendor.id } },
      },
      ErrorCodeEnum.PRODUCT_ALREADY_EXISTS,
    );

    const { images: imageIds, ...productData } = input;

    let imageFiles: File[] = [];
    if (imageIds && imageIds.length > 0) {
      imageFiles = await this.fileRepo.find({
        where: { id: In(imageIds) },
      });
      if (imageFiles.length !== imageIds.length) {
        throw new AppHttpException(ErrorCodeEnum.FILE_DOES_NOT_EXIST);
      }
    }

    const product = this.productRepo.create({
      ...productData,
      price: Math.round(input.price * 100),
      vendor: vendor,
      category: category,
      vendorId: vendor.id,
      categoryId: category.id,
      images: imageFiles,
    });

    await this.productRepo.save(product);
    return product;
  }

  async getUserFeed(user: User, pagination: PaginatorInput) {
    const page = pagination.page || 1;
    const limit = pagination.limit;

    const follows = await this.followRepo.find({
      where: { followerId: user.id },
      select: ['vendorId'],
    });

    const followedVendorIds = follows.map((f) => f.vendorId);

    if (followedVendorIds.length === 0) {
      return {
        items: [],
        pageInfo: {
          limit,
          page,
          hasPrevious: page > 1,
          hasNext: false,
          totalCount: 0,
        },
      };
    }

    return this.productRepo.findPaginated(
      { vendorId: In(followedVendorIds) },
      { createdAt: 'DESC' },
      page,
      limit,
    );
  }

  async findAll(input: GetProductsFilterInput) {
    let { page, limit, search, vendorName, categoryName, minPrice, maxPrice } =
      input;
    const where: FindOptionsWhere<Product> = {};

    if (minPrice !== undefined && maxPrice !== undefined) {
      where.price = Between(minPrice * 100, maxPrice * 100);
    } else if (minPrice !== undefined) {
      where.price = MoreThanOrEqual(minPrice * 100);
    } else if (maxPrice !== undefined) {
      where.price = LessThanOrEqual(maxPrice * 100);
    }

    if (vendorName) {
      where.vendor = { businessName: ILike(`%${vendorName}%`) };
    }

    if (categoryName) {
      where.category = { name: ILike(`%${categoryName}%`) };
    }

    let finalWhere: FindOptionsWhere<Product> | FindOptionsWhere<Product>[] =
      where;

    if (search) {
      finalWhere = [
        { ...where, name: ILike(`%${search}%`) },
        { ...where, description: ILike(`%${search}%`) },
      ];
    }

    return await this.productRepo.findPaginated(
      finalWhere,
      { createdAt: 'DESC' },
      page,
      limit,
    );
  }

  async findOne(id: string): Promise<Product | null> {
    const product = this.productRepo.findOneOrFail(
      {
        where: { id },
        relations: ['images'],
      },

      ErrorCodeEnum.PRODUCT_DOES_NOT_EXIST,
    );

    return product;
  }

  async update(user: User, input: UpdateProductInput): Promise<Product> {
    const product = await this.productRepo.findOneOrFail({
      where: { id: input.id },
      relations: {
        vendor: true,
      },
    });
    await this.checkOwnership(product, user);

    if (input.categoryId) {
      const category = await this.categoryRepo.findOne({
        where: { id: input.categoryId },
      });
      if (!category) throw new AppHttpException(ErrorCodeEnum.NOT_FOUND);
      product.category = category;
    }

    if (input.price !== undefined) {
      product.price = Math.round(input.price * 100);
    }

    if (input.name) product.name = input.name;
    if (input.description) product.description = input.description;
    if (input.inventoryCount !== undefined)
      product.inventoryCount = input.inventoryCount;
    if (input.images) {
      const imageFiles = await this.fileRepo.find({
        where: { fileName: In(input.images) },
      });
      if (imageFiles.length !== input.images.length) {
        throw new AppHttpException(ErrorCodeEnum.FILE_DOES_NOT_EXIST);
      }
      product.images = imageFiles;
    }

    return this.productRepo.save(product);
  }

  async remove(user: User, id: string): Promise<boolean> {
    const product = await this.productRepo.findOneOrFail({
      where: { id },
      relations: {
        vendor: true,
      },
    });
    await this.checkOwnership(product, user);

    await this.productRepo.remove(product);
    return true;
  }

  private async checkOwnership(product: Product, user: User) {
    const vendorProfile = await this.vendorRepo.findOne({
      where: { user: { id: user.id } },
    });

    if (
      vendorProfile &&
      product.vendor.id !== vendorProfile.id &&
      user.role !== UserRoleEnum.ADMIN
    ) {
      throw new AppHttpException(ErrorCodeEnum.FORBIDDEN);
    }
  }

  async findAllByVendor(vendorId: string, pagination: PaginatorInput) {
    const page = pagination.page;
    const limit = pagination.limit;

    return await this.productRepo.findPaginated(
      { vendor: { id: vendorId } },
      { createdAt: 'DESC' },
      page,
      limit,
    );
  }

  async findAllByCategory(categoryId: string, pagination: PaginatorInput) {
    const page = pagination.page;
    const limit = pagination.limit;

    return await this.productRepo.findPaginated(
      { category: { id: categoryId } },
      { createdAt: 'DESC' },
      page,
      limit,
    );
  }
}
