import { Resolver } from '@nestjs/graphql';
import { Blog } from '../entities/blog.entity';
import { BlogService } from '../services/blog.service';

@Resolver(() => Blog)
export class BlogResolver {
  constructor(private readonly blogService: BlogService) {}
}
