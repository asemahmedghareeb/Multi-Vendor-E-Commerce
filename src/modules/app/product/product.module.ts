import { Module } from '@nestjs/common';
import { ProductService } from './services/product.service';

import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { ProductsResolver } from './resolvers/product.resolver';
import {
  ProductByIdDataloader,
  ProductsByVendorIdDataloader,
} from './dataloaders/product.dataloader';
import { Vendor } from '../vendors/entities/vendor.entity';
import { Category } from '../categories/entities/category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Vendor, Category])],
  providers: [
    ProductsResolver,
    ProductService,
    ProductByIdDataloader,
    ProductByIdDataloader,
  ],
  exports: [ProductByIdDataloader, ProductsByVendorIdDataloader],
})
export class ProductModule {}
