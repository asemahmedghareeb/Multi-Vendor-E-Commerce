import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { BlogCategory } from '../entities/blog-category.entity';
import { Auth } from 'src/common/decorators/auth.decorator';
import { Transactional } from 'typeorm-transactional';
import { UserRoleEnum } from 'src/common/enums/user-role.enum';
import { DefaultPermissionActionsEnum } from 'src/common/enums/default-permissions.enum';
import { CreateBlogCategoryInput } from '../dtos/inputs/create-blog-category.input';
import { BlogCategoryService } from '../services/blog-category.service';
import { UpdateBlogCategoryInput } from '../dtos/inputs/update-blog-category.input';
import { PaginatedBlogCategoriesResponse } from '../dtos/responses/paginated-blog-categories.response';
import { NullablePaginatorArgsInput } from 'src/common/dtos/inputs/paginator.input';
import { GetSingleCategoryInput } from '../dtos/inputs/get-single-category.input';
import { SoftRemoveBlogCategoryInput } from '../dtos/inputs/soft-remove-blog-category.input';
import { BlogCategoryDataloader } from '../dataloaders/blog-category.dataloader';

@Resolver(() => BlogCategory)
export class BlogCategoryResolver {
  constructor(
    private readonly blogCategoryService: BlogCategoryService,
    private readonly blogCategoryDataloader: BlogCategoryDataloader,
  ) {}

  @Query(() => PaginatedBlogCategoriesResponse)
  getPaginatedBlogCategories(@Args() paginator?: NullablePaginatorArgsInput) {
    return this.blogCategoryService.getPaginatedBlogCategories(
      paginator?.paginate,
    );
  }

  @Query(() => BlogCategory)
  getSingleBlogCategory(@Args() input: GetSingleCategoryInput) {
    return this.blogCategoryService.getSingleBlogCategory(input);
  }

  @Mutation(() => Boolean)
  @Auth({
    roles: [UserRoleEnum.ADMIN],
    permissions: [
      {
        target: BlogCategory.permissionsTarget,
        action: DefaultPermissionActionsEnum.CREATE,
      },
    ],
  })
  @Transactional()
  adminCreateBlogCategory(@Args('input') input: CreateBlogCategoryInput) {
    return this.blogCategoryService.createBlogCategory(input);
  }

  @Mutation(() => Boolean)
  @Auth({
    roles: [UserRoleEnum.ADMIN],
    permissions: [
      {
        target: BlogCategory.permissionsTarget,
        action: DefaultPermissionActionsEnum.UPDATE,
      },
    ],
  })
  @Transactional()
  adminUpdateBlogCategory(@Args('input') input: UpdateBlogCategoryInput) {
    return this.blogCategoryService.updateBlogCategory(input);
  }

  @Mutation(() => Boolean)
  @Auth({
    roles: [UserRoleEnum.ADMIN],
    permissions: [
      {
        target: BlogCategory.permissionsTarget,
        action: DefaultPermissionActionsEnum.DELETE,
      },
    ],
  })
  @Transactional()
  adminSoftDeleteBlogCategory(@Args() input: SoftRemoveBlogCategoryInput) {
    return this.blogCategoryService.softDeleteBlogCategory(input);
  }

  @ResolveField(() => BlogCategory, { nullable: true })
  parentBlogCategory(@Parent() blogCategory: BlogCategory) {
    if (blogCategory.parent) return blogCategory.parent;
    const loader = this.blogCategoryDataloader.getDataloader();
    return blogCategory?.parentId && loader.load(blogCategory.parentId);
  }
}
