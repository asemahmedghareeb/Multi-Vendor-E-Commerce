import { Module } from '@nestjs/common';
import { ProductService } from './services/product.service';
import { Product } from './entities/product.entity';
import { ProductsResolver } from './resolvers/product.resolver';
import { Vendor } from '../vendors/entities/vendor.entity';
import { Category } from '../categories/entities/category.entity';
import { AppDatabaseModule } from 'src/modules/core/app-database/app-database.module';
import { VendorDataloader } from './dataloaders/vendor.dataloader';
import { CategoryLoader } from './dataloaders/category.dataloader';
import { Follow } from '../follow/entities/follow.entity';
import { MediaModule } from 'src/modules/core/media/media.module';
import { File } from 'src/modules/core/media/entities/file.entity';

@Module({
  imports: [
    AppDatabaseModule.forFeature([Product, Vendor, Category, Follow, File]),
    MediaModule,
  ],
  providers: [
    ProductsResolver,
    ProductService,
    VendorDataloader,
    CategoryLoader,
  ],
  exports: [VendorDataloader],
})
export class ProductModule {}
