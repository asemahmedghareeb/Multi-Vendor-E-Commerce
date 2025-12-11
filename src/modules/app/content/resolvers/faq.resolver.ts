import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { FAQ } from '../entities/faq.entity';
import { Auth } from 'src/common/decorators/auth.decorator';
import { UserRoleEnum } from 'src/common/enums/user-role.enum';
import { DefaultPermissionActionsEnum } from 'src/common/enums/default-permissions.enum';
import { Transactional } from 'typeorm-transactional';
import { CreateFAQInput } from '../dtos/inputs/create-faq.input';
import { FAQService } from '../services/faq.service';
import { UpdateFAQInput } from '../dtos/inputs/update-faq.input';
import { FindFAQInput } from '../dtos/inputs/find-faq.input';
import { PaginatedFAQResponse } from '../dtos/responses/paginated-faq.response';
import { NullablePaginatorArgsInput } from 'src/common/dtos/inputs/paginator.input';

@Resolver(() => FAQ)
export class FAQResolver {
  constructor(private readonly faqService: FAQService) {}

  @Query(() => FAQ)
  getSingleFAQ(@Args() input: FindFAQInput) {
    return this.faqService.getSingleFAQ(input.id);
  }

  @Query(() => PaginatedFAQResponse)
  getPaginatedFAQ(@Args() paginator?: NullablePaginatorArgsInput) {
    return this.faqService.getPaginatedFAQ(paginator?.paginate);
  }

  @Mutation(() => Boolean)
  @Transactional()
  @Auth({
    roles: [UserRoleEnum.ADMIN],
    permissions: [
      {
        target: FAQ.permissionsTarget,
        action: DefaultPermissionActionsEnum.CREATE,
      },
    ],
  })
  adminCreateFAQ(@Args('input') input: CreateFAQInput) {
    return this.faqService.createFAQ(input);
  }

  @Mutation(() => Boolean)
  @Transactional()
  @Auth({
    roles: [UserRoleEnum.ADMIN],
    permissions: [
      {
        target: FAQ.permissionsTarget,
        action: DefaultPermissionActionsEnum.UPDATE,
      },
    ],
  })
  adminUpdateFAQ(@Args('input') input: UpdateFAQInput) {
    return this.faqService.updateFAQ(input);
  }

  @Mutation(() => Boolean)
  @Transactional()
  @Auth({
    roles: [UserRoleEnum.ADMIN],
    permissions: [
      {
        target: FAQ.permissionsTarget,
        action: DefaultPermissionActionsEnum.DELETE,
      },
    ],
  })
  adminDeleteFAQ(@Args() input: FindFAQInput) {
    return this.faqService.deleteFAQ(input.id);
  }
}
