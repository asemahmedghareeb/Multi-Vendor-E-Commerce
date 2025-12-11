import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryInput } from './dto/create-category.input';
import { PaginationInput } from 'src/common/dto/pagination.input';
import { IPaginatedType } from 'src/common/dto/paginated-output';
import { UpdateCategoryInput } from './dto/update-category.input';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category) private categoryRepo: Repository<Category>,
  ) {}

  async create(input: CreateCategoryInput): Promise<Category> {
    const exists = await this.categoryRepo.findOne({
      where: { name: input.name },
    });
    if (exists) {
      throw new BadRequestException('events.category.ALREADY_EXISTS');
    }
    const category = this.categoryRepo.create({ name: input.name });

    if (input.parentId) {
      const parent = await this.categoryRepo.findOne({
        where: { id: input.parentId },
      });
      if (!parent) {
        throw new NotFoundException('events.category.NOT_FOUND');
      }
      category.parent = parent;
    }

    return this.categoryRepo.save(category);
  }

  async findAll(
    pagination: PaginationInput,
  ): Promise<IPaginatedType<Category>> {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const [items, totalItems] = await this.categoryRepo.findAndCount({
      where: { parent: IsNull() },
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      items,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
    };
  }

  async findOne(id: string): Promise<Category> {
    const category = await this.categoryRepo.findOne({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('events.category.NOT_FOUND');
    }
    return category;
  }

  async update(id: string, input: UpdateCategoryInput): Promise<Category> {
    const category: Category | null = await this.findOne(id);
    if (!category) {
      throw new NotFoundException('events.category.NOT_FOUND');
    }

    if (input.parentId) {
      const parent = await this.categoryRepo.findOne({
        where: { id: input.parentId },
      });
      if (!parent) {
        throw new NotFoundException('events.category.PARENT_NOT_FOUND');
      }
      category.parent = parent;
    }

    if (input.name) category.name = input.name;

    return this.categoryRepo.save(category);
  }

  async remove(id: string): Promise<boolean> {
    const category = await this.findOne(id);

    const hasChildren = await this.categoryRepo.count({
      where: { parent: { id } },
    });
    if (hasChildren > 0) {
      throw new BadRequestException('events.category.CANNOT_DELETE');
    }

    await this.categoryRepo.remove(category);
    return true;
  }
}
