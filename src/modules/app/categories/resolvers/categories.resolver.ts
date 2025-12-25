import {
  Resolver,
  Mutation,
  Query,
  Args,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { CategoriesService } from '../services/categories.service';
import { Category } from '../entities/category.entity';
import { CreateCategoryInput } from '../dto/inputs/create-category.input';
import { NullablePaginatorArgsInput } from 'src/common/dtos/inputs/paginator.input';
import { PaginatedCategories } from '../dto/responses/paginatedCategories';
import { UpdateCategoryInput } from '../dto/inputs/update-category.input';
import { Auth } from 'src/common/decorators/auth.decorator';
import { UserRoleEnum } from 'src/common/enums/user-role.enum';
import { DefaultPermissionActionsEnum } from 'src/common/enums/default-permissions.enum';
import { Transactional } from 'typeorm-transactional';
import { SubcategoriesLoader } from '../dataloaders/subcategories.dataloader';

@Resolver(() => Category)
export class CategoriesResolver {
  constructor(
    private readonly categoriesService: CategoriesService,
    private readonly subcategoriesLoader: SubcategoriesLoader,
  ) {}

  @Auth({
    roles: [UserRoleEnum.ADMIN],
    permissions: [
      {
        action: DefaultPermissionActionsEnum.CREATE,
        target: Category.permissionsTarget,
      },
    ],
  })
  @Mutation(() => Category)
  @Transactional()
  async createCategory(
    @Args('createCategoryInput') createCategoryInput: CreateCategoryInput,
  ) {
    return this.categoriesService.create(createCategoryInput);
  }

  @Query(() => PaginatedCategories)
  async categories(
    @Args( { nullable: true }) pagination: NullablePaginatorArgsInput,
  ) {
    return this.categoriesService.findAll(pagination.paginate);
  }

  @Query(() => Category)
  async category(@Args('id', { type: () => String }) id: string) {
    return this.categoriesService.category(id);
  }

  @Mutation(() => Category)
  @Auth({
    roles: [UserRoleEnum.ADMIN],
    permissions: [
      {
        action: DefaultPermissionActionsEnum.UPDATE,
        target: Category.permissionsTarget,
      },
    ],
  })
  async updateCategory(
    @Args('updateCategoryInput') updateCategoryInput: UpdateCategoryInput,
  ) {
    return this.categoriesService.update(
      updateCategoryInput.id,
      updateCategoryInput,
    );
  }

  @Mutation(() => Boolean)
  @Auth({
    roles: [UserRoleEnum.ADMIN],
    permissions: [
      {
        action: DefaultPermissionActionsEnum.DELETE,
        target: Category.permissionsTarget,
      },
    ],
  })
  async removeCategory(@Args('id', { type: () => String }) id: string) {
    return this.categoriesService.remove(id);
  }
  @ResolveField(() => [Category])
  async children(@Parent() category: Category) {
    return this.subcategoriesLoader.getDataloader().load(category.id);
  }

  //   @ResolveField(() => Category, { nullable: true })
  //   async parent(@Parent() category: Category) {
  //     if (!category.parentId) return null;
  //     return this.categoryLoader.batchCategories.load(category.parentId);
  //   }
}
