import { AppRequestScopedDataloader } from 'src/common/decorators/app-request-scoped-dataloader.decorator';
import { AppDataloader } from 'src/common/interfaces/dataloader.interface';
import * as Dataloader from 'dataloader';
import { Category } from '../entities/category.entity';
import { AppRepository } from 'src/modules/core/app-database/repositories/app.repository';
import { InjectAppRepository } from 'src/common/decorators/inject-app-repository.decorator';
import { In } from 'typeorm';

@AppRequestScopedDataloader()
export class SubcategoriesLoader implements AppDataloader<string, Category[]> {
  loader: Dataloader<string, Category[]>;

  constructor(
    @InjectAppRepository(Category)
    private readonly categoryRepository: AppRepository<Category>,
  ) {
    this.loader = new Dataloader((parentIds: string[]) =>
      this.getSubcategoriesByParentIds(parentIds),
    );
  }

  private async getSubcategoriesByParentIds(parentIds: string[]) {
    const subcategories = await this.categoryRepository.find({
      where: {
        parentId: In(parentIds),
      },
      withDeleted: true,
    });
    const subcategoriesMap = {};

    subcategories.forEach((subcategory) => {
      if (!subcategoriesMap[subcategory.parentId]) {
        subcategoriesMap[subcategory.parentId] = [];
      }
      subcategoriesMap[subcategory.parentId].push(subcategory);
    });

    return parentIds.map((id) => subcategoriesMap[id] || []);
  }

  getDataloader(): Dataloader<string, Category[]> {
    return this.loader;
  }
}