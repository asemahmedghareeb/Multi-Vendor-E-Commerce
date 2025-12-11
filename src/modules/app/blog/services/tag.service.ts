import { Injectable } from '@nestjs/common';
import { AppRepository } from 'src/modules/core/app-database/repositories/app.repository';
import { Tag } from '../entities/tag.entity';
import { InjectAppRepository } from 'src/common/decorators/inject-app-repository.decorator';
import { CreateTagInput } from '../dtos/inputs/create-tag.input';
import { ErrorCodeEnum } from 'src/common/enums/error-code.enum';
import { UpdateTagInput } from '../dtos/inputs/update-tag.input';
import { GetSingleTagInput } from '../dtos/inputs/get-single-tag.input';
import { PaginatorInput } from 'src/common/dtos/inputs/paginator.input';
import { SoftRemoveTagInput } from '../dtos/inputs/soft-remove-tag.input';

@Injectable()
export class TagService {
  constructor(
    @InjectAppRepository(Tag)
    private readonly tagRepository: AppRepository<Tag>,
  ) {}

  async createTag(input: CreateTagInput) {
    await this.tagRepository.findOneAndFail(
      {
        where: {
          slug: input.slug,
        },
        withDeleted: true,
      },
      ErrorCodeEnum.SLUG_ALREADY_EXIST,
    );

    await this.tagRepository.createOne(input);

    return true;
  }

  getSingleTag(input: GetSingleTagInput) {
    return this.tagRepository.findOneOrFail(
      {
        where: {
          id: input.id,
        },
      },
      ErrorCodeEnum.TAG_DOES_NOT_EXIST,
    );
  }

  getPaginatedTags(paginatorInput?: PaginatorInput) {
    return this.tagRepository.findPaginated(
      undefined,
      undefined,
      paginatorInput?.page,
      paginatorInput?.limit,
    );
  }

  async updateTag(input: UpdateTagInput) {
    const tag = await this.tagRepository.findOneOrFail({
      where: {
        id: input.id,
      },
    });

    if (input.slug) {
      await this.tagRepository.findOneAndFail(
        {
          where: {
            slug: input.slug,
          },
          withDeleted: true,
        },
        ErrorCodeEnum.SLUG_ALREADY_EXIST,
      );

      //todo add slug redirect
    }

    await this.tagRepository.updateOneFromExistingModel(tag, input);

    return true;
  }

  async softRemoveTag(input: SoftRemoveTagInput) {
    const tag = await this.tagRepository.findOneOrFail(
      {
        where: {
          id: input.id,
        },
      },
      ErrorCodeEnum.TAG_DOES_NOT_EXIST,
    );

    await this.tagRepository.softRemove(tag);

    return true;
  }
}
