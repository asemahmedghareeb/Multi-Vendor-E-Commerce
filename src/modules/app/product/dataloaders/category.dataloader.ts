import { AppRequestScopedDataloader } from 'src/common/decorators/app-request-scoped-dataloader.decorator';
import { AppDataloader } from 'src/common/interfaces/dataloader.interface';
import * as Dataloader from 'dataloader';
import { Category } from '../../categories/entities/category.entity';
import { AppRepository } from 'src/modules/core/app-database/repositories/app.repository';
import { InjectAppRepository } from 'src/common/decorators/inject-app-repository.decorator';
import { In } from 'typeorm';

@AppRequestScopedDataloader()
export class CategoryLoader implements AppDataloader<string, Category> {
  loader: Dataloader<string, Category>;

  constructor(
    @InjectAppRepository(Category)
    private readonly categoryRepository: AppRepository<Category>,
  ) {
    this.loader = new Dataloader((categoryIds: string[]) =>
      this.getCategoriesByIds(categoryIds),
    );
  }

  private async getCategoriesByIds(categoryIds: string[]) {
    const categories = await this.categoryRepository.find({
      where: {
        id: In(categoryIds),
      },
      withDeleted: true,
    });
    const categoryMap = {};

    categories.forEach((category) => (categoryMap[category.id] = category));

    return categoryIds.map((id) => categoryMap[id]);
  }

  getDataloader(): Dataloader<string, Category> {
    return this.loader;
  }
}
