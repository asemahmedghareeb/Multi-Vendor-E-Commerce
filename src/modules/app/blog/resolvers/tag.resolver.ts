import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Tag } from '../entities/tag.entity';
import { Transactional } from 'typeorm-transactional';
import { Auth } from 'src/common/decorators/auth.decorator';
import { UserRoleEnum } from 'src/common/enums/user-role.enum';
import { DefaultPermissionActionsEnum } from 'src/common/enums/default-permissions.enum';
import { CreateTagInput } from '../dtos/inputs/create-tag.input';
import { TagService } from '../services/tag.service';
import { UpdateTagInput } from '../dtos/inputs/update-tag.input';
import { GetSingleTagInput } from '../dtos/inputs/get-single-tag.input';
import { PaginatedTagsResponse } from '../dtos/responses/paginated-tags.response';
import { NullablePaginatorArgsInput } from 'src/common/dtos/inputs/paginator.input';
import { SoftRemoveTagInput } from '../dtos/inputs/soft-remove-tag.input';

@Resolver(() => Tag)
export class TagResolver {
  constructor(private readonly tagService: TagService) {}
  @Query(() => Tag)
  getSingleTag(@Args() input: GetSingleTagInput) {
    return this.tagService.getSingleTag(input);
  }

  @Query(() => PaginatedTagsResponse)
  getPaginatedTags(@Args() paginator?: NullablePaginatorArgsInput) {
    return this.tagService.getPaginatedTags(paginator?.paginate);
  }

  @Mutation(() => Boolean)
  @Auth({
    roles: [UserRoleEnum.ADMIN],
    permissions: [
      {
        target: Tag.permissionsTarget,
        action: DefaultPermissionActionsEnum.CREATE,
      },
    ],
  })
  @Transactional()
  adminCreateTag(@Args('input') input: CreateTagInput) {
    return this.tagService.createTag(input);
  }

  @Mutation(() => Boolean)
  @Auth({
    roles: [UserRoleEnum.ADMIN],
    permissions: [
      {
        target: Tag.permissionsTarget,
        action: DefaultPermissionActionsEnum.UPDATE,
      },
    ],
  })
  @Transactional()
  adminUpdateTag(@Args('input') input: UpdateTagInput) {
    return this.tagService.updateTag(input);
  }

  @Mutation(() => Boolean)
  @Auth({
    roles: [UserRoleEnum.ADMIN],
    permissions: [
      {
        target: Tag.permissionsTarget,
        action: DefaultPermissionActionsEnum.DELETE,
      },
    ],
  })
  @Transactional()
  adminSoftRemoveTag(@Args() input: SoftRemoveTagInput) {
    return this.tagService.softRemoveTag(input);
  }
}
