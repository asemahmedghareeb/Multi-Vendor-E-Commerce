import { Injectable } from '@nestjs/common';
import { IsNull } from 'typeorm';
import { Category } from '../entities/category.entity';
import { CreateCategoryInput } from '../dto/inputs/create-category.input';
import { PaginatorInput } from 'src/common/dtos/inputs/paginator.input';
import { InjectAppRepository } from 'src/common/decorators/inject-app-repository.decorator';
import { AppRepository } from 'src/modules/core/app-database/repositories/app.repository';
import { AppHttpException } from 'src/common/exceptions/app-http.exception';
import { ErrorCodeEnum } from 'src/common/enums/error-code.enum';
import { UpdateCategoryInput } from '../dto/inputs/update-category.input';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectAppRepository(Category)
    private categoryRepo: AppRepository<Category>,
  ) {}

  async create(input: CreateCategoryInput): Promise<Category> {
    this.categoryRepo.findOneAndFail({
      where: { name: input.name },
    });

    const category = this.categoryRepo.create({ name: input.name });

    if (input.parentId) {
      const parent = await this.categoryRepo.findOneOrFail({
        where: { id: input.parentId },
      });

      category.parent = parent;
    }

    return this.categoryRepo.save(category);
  }

  async findAll(pagination?: PaginatorInput) {
    return this.categoryRepo.findPaginated(
      { parent: IsNull() },
      { createdAt: 'DESC' },
      pagination?.page,
      pagination?.limit,
      {
        parent: true,
      },
    );
  }

  async category(id: string): Promise<Category> {
    return this.categoryRepo.findOneOrFail({
      where: { id },
      relations: ['parent', 'children'],
    });
  }

  async update(id: string, input: UpdateCategoryInput): Promise<Category> {
    const category = await this.categoryRepo.findOneOrFail({ where: { id } });
    if (input.parentId) {
      const parent = await this.categoryRepo.findOne({
        where: { id: input.parentId },
      });
      if (!parent) {
        throw new AppHttpException(ErrorCodeEnum.NOT_FOUND);
      }
      category.parent = parent;
    }
    if (input.name) category.name = input.name;

    return this.categoryRepo.save(category);
  }

  async remove(id: string): Promise<boolean> {
    const category = await this.categoryRepo.findOneOrFail({
      where: { id },
    });

    const hasChildren = await this.categoryRepo.count({
      where: { parent: { id } },
    });
    if (hasChildren > 0) {
      throw new AppHttpException(ErrorCodeEnum.BAD_REQUEST_EXCEPTION);
    }

    await this.categoryRepo.remove(category);
    return true;
  }
}
