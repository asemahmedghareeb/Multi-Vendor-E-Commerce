import { Injectable } from '@nestjs/common';
import { AppRepository } from 'src/modules/core/app-database/repositories/app.repository';
import { BlogCategory } from '../entities/blog-category.entity';
import { InjectAppRepository } from 'src/common/decorators/inject-app-repository.decorator';
import { CreateBlogCategoryInput } from '../dtos/inputs/create-blog-category.input';
import { AppHttpException } from 'src/common/exceptions/app-http.exception';
import { ErrorCodeEnum } from 'src/common/enums/error-code.enum';
import { UpdateBlogCategoryInput } from '../dtos/inputs/update-blog-category.input';
import { PaginatorInput } from 'src/common/dtos/inputs/paginator.input';
import { GetSingleCategoryInput } from '../dtos/inputs/get-single-category.input';
import { SoftRemoveBlogCategoryInput } from '../dtos/inputs/soft-remove-blog-category.input';

@Injectable()
export class BlogCategoryService {
  constructor(
    @InjectAppRepository(BlogCategory)
    private readonly blogCategoryRepository: AppRepository<BlogCategory>,
  ) {}

  private async validateParentBlogCategory(
    parentId?: string,
    child?: BlogCategory,
  ) {
    if (!parentId) {
      throw new AppHttpException(ErrorCodeEnum.NESTED_BLOG_CATEGORY_PARENT);
    }

    const parentBlogCategory = await this.blogCategoryRepository.findOne({
      where: {
        id: parentId,
      },
    });

    if (!parentBlogCategory)
      throw new AppHttpException(
        ErrorCodeEnum.PARENT_BLOG_CATEGORY_DOES_NOT_EXIST,
      );

    if (!parentBlogCategory.isParent || (child && child.id == parentId))
      throw new AppHttpException(ErrorCodeEnum.NESTED_BLOG_CATEGORY_PARENT);
  }

  async createBlogCategory(input: CreateBlogCategoryInput) {
    if (input.parentId) await this.validateParentBlogCategory(input.parentId);

    await this.blogCategoryRepository.findOneAndFail(
      {
        where: { slug: input.slug },
        withDeleted: true,
      },
      ErrorCodeEnum.SLUG_ALREADY_EXIST,
    );

    await this.blogCategoryRepository.createOne(input);

    return true;
  }

  async getPaginatedBlogCategories(paginatorInput?: PaginatorInput) {
    return this.blogCategoryRepository.findPaginated(
      undefined,
      undefined,
      paginatorInput?.page,
      paginatorInput?.limit,
    );
  }

  getSingleBlogCategory(input: GetSingleCategoryInput) {
    return this.blogCategoryRepository.findOneOrFail(
      {
        where: {
          id: input.id,
        },
      },
      ErrorCodeEnum.BLOG_CATEGORY_DOES_NOT_EXIST,
    );
  }

  async updateBlogCategory(input: UpdateBlogCategoryInput) {
    const blogCategory = await this.blogCategoryRepository.findOneOrFail(
      {
        where: {
          id: input.id,
        },
      },
      ErrorCodeEnum.BLOG_CATEGORY_ALREADY_EXIST,
    );

    if (input.parentId)
      await this.validateParentBlogCategory(input.parentId, blogCategory);

    if (input.slug) {
      await this.blogCategoryRepository.findOneAndFail(
        {
          where: { slug: input.slug },
          withDeleted: true,
        },
        ErrorCodeEnum.SLUG_ALREADY_EXIST,
      );

      // todo add slug redirects
    }

    await this.blogCategoryRepository.updateOneFromExistingModel(
      blogCategory,
      input,
    );

    return true;
  }
  async softDeleteBlogCategory(input: SoftRemoveBlogCategoryInput) {
    const blogCategory = await this.blogCategoryRepository.findOneOrFail(
      {
        where: {
          id: input.id,
        },
      },
      ErrorCodeEnum.BLOG_CATEGORY_DOES_NOT_EXIST,
    );

    await this.blogCategoryRepository.softRemove(blogCategory);

    return true;
  }
}
