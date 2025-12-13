import { Module } from '@nestjs/common';
import { ProductService } from './services/product.service';
import { Product } from './entities/product.entity';
import { ProductsResolver } from './resolvers/product.resolver';
// import {
//   ProductByIdDataloader,
//   ProductsByVendorIdDataloader,
// } from './dataloaders/product.dataloader';
import { Vendor } from '../vendors/entities/vendor.entity';
import { Category } from '../categories/entities/category.entity';
import { AppDatabaseModule } from 'src/modules/core/app-database/app-database.module';

@Module({
  imports: [AppDatabaseModule.forFeature([Product, Vendor, Category])],
  providers: [
    ProductsResolver,
    ProductService,
    // ProductByIdDataloader,
    // ProductByIdDataloader,
  ],
  // exports: [ProductByIdDataloader, ProductsByVendorIdDataloader],
})
export class ProductModule {}
