import { Injectable } from '@nestjs/common';
import { InjectAppRepository } from 'src/common/decorators/inject-app-repository.decorator';
import { Blog } from '../entities/blog.entity';
import { AppRepository } from 'src/modules/core/app-database/repositories/app.repository';

@Injectable()
export class BlogService {
  constructor(@InjectAppRepository(Blog) blogRepository: AppRepository<Blog>) {}
}
