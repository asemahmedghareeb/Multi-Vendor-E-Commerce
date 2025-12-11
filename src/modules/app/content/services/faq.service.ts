import { AppRepository } from 'src/modules/core/app-database/repositories/app.repository';
import { FAQ } from '../entities/faq.entity';
import { InjectAppRepository } from 'src/common/decorators/inject-app-repository.decorator';
import { CreateFAQInput } from '../dtos/inputs/create-faq.input';
import { AppHelperService } from 'src/modules/core/app-helper/services/app-helper.service';
import { CodePrefixEnum } from 'src/modules/core/app-helper/enums/code-prefix.enum';
import { UpdateFAQInput } from '../dtos/inputs/update-faq.input';
import { AppHttpException } from 'src/common/exceptions/app-http.exception';
import { ErrorCodeEnum } from 'src/common/enums/error-code.enum';
import { PaginatorInput } from 'src/common/dtos/inputs/paginator.input';
import { Injectable } from '@nestjs/common';

@Injectable()
export class FAQService {
  constructor(
    @InjectAppRepository(FAQ)
    private readonly faqRepository: AppRepository<FAQ>,
    private readonly appHelperService: AppHelperService,
  ) {}

  async createFAQ(input: CreateFAQInput) {
    await this.faqRepository.createOne({
      ...input,
      code: await this.appHelperService.generateEntityCodeWithPrefix(
        CodePrefixEnum.FAQ,
        this.faqRepository,
      ),
    });

    return true;
  }

  async getSingleFAQ(id: string) {
    const faq = await this.faqRepository.findOne({
      where: {
        id,
      },
    });

    if (!faq) {
      throw new AppHttpException(ErrorCodeEnum.FAQ_DOES_NOT_EXIST);
    }

    return faq;
  }

  getPaginatedFAQ(paginatorInput?: PaginatorInput) {
    return this.faqRepository.findPaginated(
      undefined,
      undefined,
      paginatorInput?.page,
      paginatorInput?.limit,
    );
  }

  async updateFAQ(input: UpdateFAQInput) {
    const faq = await this.faqRepository.findOne({
      where: {
        id: input.id,
      },
    });

    if (!faq) {
      throw new AppHttpException(ErrorCodeEnum.FAQ_DOES_NOT_EXIST);
    }

    await this.faqRepository.updateOneFromExistingModel(faq, input);

    return true;
  }

  async deleteFAQ(id: string) {
    const faq = await this.faqRepository.findOne({
      where: {
        id,
      },
    });

    if (!faq) throw new AppHttpException(ErrorCodeEnum.FAQ_DOES_NOT_EXIST);

    await this.faqRepository.remove(faq);

    return true;
  }
}
