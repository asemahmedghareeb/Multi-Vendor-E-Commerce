import { Module } from '@nestjs/common';
import { AppDatabaseModule } from 'src/modules/core/app-database/app-database.module';
import { BlogCategory } from './entities/blog-category.entity';
import { BlogMedia } from './entities/blog-media.entity';
import { BlogMetadata } from './entities/blog-metadata.entity';
import { BlogTag } from './entities/blog-tag.entity';
import { Blog } from './entities/blog.entity';
import { SlugRedirects } from './entities/slug-redirects.entity';
import { Tag } from './entities/tag.entity';
import { BlogCategoryService } from './services/blog-category.service';
import { BlogCategoryResolver } from './resolvers/blog-category.resolver';
import { BlogCategoryDataloader } from './dataloaders/blog-category.dataloader';
import { TagService } from './services/tag.service';
import { TagResolver } from './resolvers/tag.resolver';
import { BlogService } from './services/blog.service';
import { BlogResolver } from './resolvers/blog.resolver';

@Module({
  imports: [
    AppDatabaseModule.forFeature([
      BlogCategory,
      BlogMedia,
      BlogMetadata,
      BlogTag,
      Blog,
      SlugRedirects,
      Tag,
    ]),
  ],
  providers: [
    BlogCategoryDataloader,
    BlogCategoryService,
    BlogCategoryResolver,
    TagService,
    TagResolver,
    BlogService,
    BlogResolver,
  ],
  exports: [],
})
export class BlogModule {}