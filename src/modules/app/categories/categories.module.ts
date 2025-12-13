import { Module } from '@nestjs/common';
// import { CategoriesService } from './categories.service';
// import { CategoriesResolver } from './categories.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { ProductModule } from '../product/product.module';
import { AppDatabaseModule } from 'src/modules/core/app-database/app-database.module';


@Module({
  imports: [AppDatabaseModule.forFeature([Category]), ProductModule],
  // providers: [CategoriesResolver, CategoriesService],
})
export class CategoriesModule {}
