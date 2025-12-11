import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AppContact } from '../entities/app-contact.entity';
import { Transactional } from 'typeorm-transactional';
import { Auth } from 'src/common/decorators/auth.decorator';
import { UserRoleEnum } from 'src/common/enums/user-role.enum';
import { DefaultPermissionActionsEnum } from 'src/common/enums/default-permissions.enum';
import { SetAppContactInput } from '../dtos/inputs/set-app-contact.input';
import { AppContactsService } from '../services/app-contacts.service';
import { NullablePaginatorArgsInput } from 'src/common/dtos/inputs/paginator.input';
import { PaginatedAppContactsResponse } from '../dtos/responses/paginated-app-contacts.response';
import { FindAppContactInput } from '../dtos/inputs/find-app-contact.input';

@Resolver(() => AppContact)
export class AppContactsResolver {
  constructor(private readonly appContactsService: AppContactsService) {}

  @Query(() => PaginatedAppContactsResponse)
  findPaginatedAppContacts(@Args() paginator?: NullablePaginatorArgsInput) {
    return this.appContactsService.findPaginatedAppContacts(
      paginator?.paginate,
    );
  }

  @Query(() => AppContact)
  findSingleAppContact(@Args() input: FindAppContactInput) {
    return this.appContactsService.findSingleAppContact(input.id);
  }

  @Mutation(() => Boolean)
  @Transactional()
  @Auth({
    roles: [UserRoleEnum.ADMIN],
    permissions: [
      {
        action: DefaultPermissionActionsEnum.CREATE,
        target: AppContact.permissionsTarget,
      },
    ],
  })
  adminSetAppContact(@Args('input') input: SetAppContactInput) {
    return this.appContactsService.setAppContact(input);
  }

  @Mutation(() => Boolean)
  @Transactional()
  @Auth({
    roles: [UserRoleEnum.ADMIN],
    permissions: [
      {
        action: DefaultPermissionActionsEnum.DELETE,
        target: AppContact.permissionsTarget,
      },
    ],
  })
  adminDeleteAppContact(@Args() input: FindAppContactInput) {
    return this.appContactsService.deleteAppContact(input.id);
  }
}
