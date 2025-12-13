import { Injectable } from '@nestjs/common';
import {
  Between,
  FindOptionsWhere,
  ILike,
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
@Injectable()
export class ProductService {
  constructor(
    @InjectAppRepository(Product)
    private readonly productRepo: AppRepository<Product>,
    @InjectAppRepository(Vendor)
    private readonly vendorRepo: AppRepository<Vendor>,
    @InjectAppRepository(Category)
    private readonly categoryRepo: AppRepository<Category>,
  ) {}

  async create(userId: string, input: CreateProductInput): Promise<Product> {
    const vendor = await this.vendorRepo.findOneOrFail({
      where: { user: { id: userId } },
    });

    if(vendor.status !== VendorStatus.VERIFIED)
    throw new AppHttpException(ErrorCodeEnum.FORBIDDEN);

  
    const category = await this.categoryRepo.findOneOrFail({
      where: { id: input.categoryId!.toString() },
    });

    const product = this.productRepo.create({
      ...input,
      price: Math.round(input.price * 100),
      vendor: vendor,
      category: category,
      vendorId: vendor.id,
      categoryId: category.id,
    });

    await this.productRepo.save(product);
    return product;
  }

  async getUserFeed(user: User, pagination: PaginatorInput) {
    const userId = user.id;
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 10;
    const skip = (page - 1) * limit;

    const qb = this.productRepo.createQueryBuilder('product');

    qb.innerJoin(Follow, 'follow', 'follow.vendor.id = product.vendor.id');

    qb.where('follow.follower_id = :userId', { userId });

    qb.leftJoinAndSelect('product.vendor', 'vendor');

    qb.orderBy('product.createdAt', 'DESC');
    qb.skip(skip).take(limit);

    const [items, totalItems] = await qb.getManyAndCount();

    return {
      items,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
    };
  }

  async findAll(input: GetProductsFilterInput) {
    let { page, limit, search, vendorName, categoryName, minPrice, maxPrice } =
      input;

    page = page || 1;
    limit = limit || 10;
    const skip = (page - 1) * limit;

    const baseWhere: FindOptionsWhere<Product> = {};

    if (minPrice !== undefined) {
      baseWhere.price = MoreThanOrEqual(minPrice * 100);
    }

    if (maxPrice !== undefined && minPrice !== undefined) {
      baseWhere.price = baseWhere.price
        ? Between(minPrice * 100, maxPrice * 100)
        : LessThanOrEqual(maxPrice * 100);
    }

    if (vendorName) {
      baseWhere.vendor = {
        businessName: ILike(`%${vendorName}%`),
      };
    }

    if (categoryName) {
      baseWhere.category = {
        name: ILike(`%${categoryName}%`),
      };
    }

    let finalWhere: FindOptionsWhere<Product> | FindOptionsWhere<Product>[];

    if (search) {
      finalWhere = [
        { ...baseWhere, name: ILike(`%${search}%`) },
        { ...baseWhere, description: ILike(`%${search}%`) },
      ];
    } else {
      finalWhere = baseWhere;
    }

    const [items, totalItems] = await this.productRepo.findAndCount({
      where: finalWhere,
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      items,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
    };
  }

  async findOne(id: string): Promise<Product | null> {
    const product: Product | null = await this.productRepo.findOne({
      where: { id },
    });

    if (!product) {
      throw new AppHttpException(ErrorCodeEnum.NOT_FOUND);
    }
    return product;
  }

  async update(userId: string, input: UpdateProductInput): Promise<Product> {
    const product= await this.productRepo.findOneOrFail({where:{id:input.id}});
    await this.checkOwnership(product, userId);

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
    if (input.images) product.images = input.images;

    return this.productRepo.save(product);
  }

  async remove(userId: string, userRole: string, id: string): Promise<boolean> {
    const product = await this.productRepo.findOneOrFail({where:{id}});
    await this.checkOwnership(product, userId);

    await this.productRepo.remove(product);
    return true;
  }

  private async checkOwnership(product: Product, userId: string) {
    const vendorProfile = await this.vendorRepo.findOne({
      where: { user: { id: userId } },
    });
    if (!vendorProfile || product.vendor.id !== vendorProfile.id) {
      throw new AppHttpException(ErrorCodeEnum.FORBIDDEN);
    }
  }

  async findAllByVendor(vendorId: string, pagination: PaginatorInput) {
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 10;
    const skip = (page - 1) * limit;

    const [items, totalItems] = await this.productRepo.findAndCount({
      where: { vendor: { id: vendorId } },
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      items,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
    };
  }

  async findAllByCategory(categoryId: string, pagination: PaginatorInput) {
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 10;
    const skip = (page - 1) * limit;

    const [items, totalItems] = await this.productRepo.findAndCount({
      where: { category: { id: categoryId } },
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      items,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
    };
  }
}
