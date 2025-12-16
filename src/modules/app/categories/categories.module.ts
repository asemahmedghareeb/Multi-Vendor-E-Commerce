import { Module } from '@nestjs/common';

import { Category } from './entities/category.entity';
import { ProductModule } from '../product/product.module';
import { AppDatabaseModule } from 'src/modules/core/app-database/app-database.module';
import { SubcategoriesLoader } from './dataloaders/subcategories.dataloader';
import { CategoriesService } from './services/categories.service';
import { CategoriesResolver } from './resolvers/categories.resolver';

@Module({
  imports: [AppDatabaseModule.forFeature([Category]), ProductModule],
  providers: [CategoriesResolver, CategoriesService, SubcategoriesLoader],
})
export class CategoriesModule {}
