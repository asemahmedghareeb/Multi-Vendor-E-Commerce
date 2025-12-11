import { paginatedObjectTypeFactory } from 'src/common/utilities/object-paginated-type.factory';
import { BlogCategory } from '../../entities/blog-category.entity';

export const PaginatedBlogCategoriesResponse =
  paginatedObjectTypeFactory(BlogCategory);
