import { PaginationInput } from '../common/dto/pagination.input';
import {
  Resolver,
  Mutation,
  Query,
  Args,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { Category } from './entities/category.entity';
import { CreateCategoryInput } from './dto/create-category.input';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { genericPaginated } from '../common/dto/paginated-output';
import { UpdateCategoryInput } from './dto/update-category.input';
import { CategoryLoader } from 'src/dataLoaders/category.loader';
import { paginatedProduct } from 'src/products/products.resolver';
import { ProductsService } from 'src/products/products.service';
import { Role } from 'src/auth/guards/role.enum';
const paginatedCategory = genericPaginated(Category);
@Resolver(() => Category)
export class CategoriesResolver {
  constructor(
    private readonly categoriesService: CategoriesService,
    private readonly productsService: ProductsService,

    private readonly categoryLoader: CategoryLoader,
  ) {}

  @Mutation(() => Category)
  @Roles(Role.SUPER_ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  async createCategory(
    @Args('createCategoryInput') createCategoryInput: CreateCategoryInput,
  ) {
    return this.categoriesService.create(createCategoryInput);
  }

  @Query(() => paginatedCategory)
  async categories(
    @Args('pagination', { nullable: true }) pagination?: PaginationInput,
  ) {
    const input = pagination || { page: 1, limit: 10 };
    return this.categoriesService.findAll(input);
  }

  @Query(() => Category)
  async category(@Args('id', { type: () => String }) id: string) {
    return this.categoriesService.findOne(id);
  }

  @Mutation(() => Category)
  @Roles(Role.SUPER_ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  async updateCategory(
    @Args('updateCategoryInput') updateCategoryInput: UpdateCategoryInput,
  ) {
    return this.categoriesService.update(
      updateCategoryInput.id,
      updateCategoryInput,
    );
  }

  @Mutation(() => Boolean)
  @Roles(Role.SUPER_ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  async removeCategory(@Args('id', { type: () => String }) id: string) {
    return this.categoriesService.remove(id);
  }

  @ResolveField(() => Category, { nullable: true })
  async parent(@Parent() category: Category) {
    if (!category.parentId) return null;
    return this.categoryLoader.batchCategories.load(category.parentId);
  }

  @ResolveField(() => [Category])
  async children(@Parent() category: Category) {
    return this.categoryLoader.batchChildren.load(category.id);
  }

  @ResolveField(() => paginatedProduct)
  async products(
    @Parent() category: Category,
    @Args('pagination', { nullable: true }) pagination?: PaginationInput,
  ) {
    const input = pagination || { page: 1, limit: 10 };

    return this.productsService.findAllByCategory(category.id, input);
  }
}
 