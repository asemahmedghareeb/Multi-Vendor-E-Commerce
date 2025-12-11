import { AppRequestScopedDataloader } from 'src/common/decorators/app-request-scoped-dataloader.decorator';
import { AppDataloader } from 'src/common/interfaces/dataloader.interface';
import * as Dataloader from 'dataloader';
import { BlogCategory } from '../entities/blog-category.entity';
import { AppRepository } from 'src/modules/core/app-database/repositories/app.repository';
import { InjectAppRepository } from 'src/common/decorators/inject-app-repository.decorator';
import { In } from 'typeorm';

@AppRequestScopedDataloader()
export class BlogCategoryDataloader
  implements AppDataloader<string, BlogCategory>
{
  loader: Dataloader<string, BlogCategory>;

  constructor(
    @InjectAppRepository(BlogCategory)
    private readonly blogCategoryRepository: AppRepository<BlogCategory>,
  ) {
    this.loader = new Dataloader((blogCategoryIds: string[]) =>
      this.getBlogCategoriesByIds(blogCategoryIds),
    );
  }

  private async getBlogCategoriesByIds(blogCategoriesIds: string[]) {
    const blogCategories = await this.blogCategoryRepository.find({
      where: {
        id: In(blogCategoriesIds),
      },
      withDeleted: true,
    });
    const blogCategoryMap = {};

    blogCategories.forEach(
      (blogCategory) => (blogCategoryMap[blogCategory.id] = blogCategory),
    );

    return blogCategoriesIds.map((id) => blogCategoryMap[id]);
  }

  getDataloader(): Dataloader<string, BlogCategory> {
    return this.loader;
  }
}
