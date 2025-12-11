import {
  Args,
  Context,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { UserActivity } from '../entities/user-activity.entity';
import { Auth } from 'src/common/decorators/auth.decorator';
import { UserRoleEnum } from 'src/common/enums/user-role.enum';
import { DefaultPermissionActionsEnum } from 'src/common/enums/default-permissions.enum';
import { MonitoringService } from '../services/monitoring.service';
import { PaginatedUserActivityResponse } from '../dtos/responses/paginated-user-activity.response';
import { AdminGetUsersActivityInput } from '../dtos/inputs/admin-get-users-activity.input';
import { SessionDataloader } from '../dataloaders/session.dataloader';
import { Session } from 'src/modules/app/auth-base/session/entities/session.entity';
import { AppGqlContext } from 'src/common/types/gql-context.type';
import { ErrorCodeEnum } from 'src/common/enums/error-code.enum';
import { AppHelperService } from '../../app-helper/services/app-helper.service';

@Resolver(() => UserActivity)
export class UserActivityResolver {
  constructor(
    private readonly monitoringService: MonitoringService,
    private readonly sessionDataloader: SessionDataloader,
    private readonly appHelperService: AppHelperService,
  ) {}

  @Query(() => PaginatedUserActivityResponse)
  @Auth({
    roles: [UserRoleEnum.ADMIN],
    permissions: [
      {
        target: UserActivity.permissionsTarget,
        action: DefaultPermissionActionsEnum.READ,
      },
    ],
  })
  adminGetUsersActivity(
    @Args({ nullable: true }) input: AdminGetUsersActivityInput,
  ) {
    return this.monitoringService.findPaginateUserActivity(
      input.paginate,
      input.filter,
      input.sortBy,
    );
  }

  @ResolveField(() => Session, { nullable: true })
  session(@Parent() userActivity: UserActivity) {
    if (userActivity.session) return userActivity.session;

    if (userActivity.sessionId) {
      const loader = this.sessionDataloader.getDataloader();
      return loader.load(userActivity.sessionId);
    }
  }

  @ResolveField(() => String)
  message(
    @Parent() userActivity: UserActivity,
    @Context() context: AppGqlContext,
  ) {
    return this.appHelperService.localize(
      userActivity.code == 200
        ? `messages.SUCCESS`
        : `errors.${ErrorCodeEnum[userActivity.code]}`,
      {},
      context.lang,
    );
  }
}
