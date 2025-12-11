import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Notification } from '../entities/notification.entity';
import { NotificationService } from '../services/notification.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { User } from '../../auth-base/user/entities/user.entity';
import { SendNotificationInput } from '../dtos/inputs/send-notification.input';
import { Transactional } from 'typeorm-transactional';
import { Auth } from 'src/common/decorators/auth.decorator';
import { UserRoleEnum } from 'src/common/enums/user-role.enum';
import { DefaultPermissionActionsEnum } from 'src/common/enums/default-permissions.enum';
import { PaginatedNotificationsResponse } from '../dtos/responses/paginated-notifications.response';
import { NullablePaginatorArgsInput } from 'src/common/dtos/inputs/paginator.input';
import { markNotificationAsReadInput } from '../dtos/inputs/mark-notification-as-read.input';

@Resolver(() => Notification)
export class NotificationResolver {
  constructor(private readonly notificationService: NotificationService) {}

  @Query(() => PaginatedNotificationsResponse)
  @Auth()
  getCurrentUserNotifications(
    @CurrentUser() user: User,
    @Args({ nullable: true }) paginationInput: NullablePaginatorArgsInput,
  ) {
    return this.notificationService.getUserNotifications(
      user,
      paginationInput.paginate,
    );
  }

  @Mutation(() => Boolean)
  @Transactional()
  @Auth({
    roles: [UserRoleEnum.ADMIN],
    permissions: [
      {
        action: DefaultPermissionActionsEnum.CREATE,
        target: Notification.permissionsTarget,
      },
    ],
  })
  adminSendNotification(
    @CurrentUser() user: User,
    @Args('input') input: SendNotificationInput,
  ) {
    return this.notificationService.SendNotification(input, user);
  }

  @Mutation(() => Boolean)
  @Transactional()
  @Auth()
  markNotificationAsSeen(
    @CurrentUser() currentUser: User,
    @Args() input: markNotificationAsReadInput,
  ) {
    return this.notificationService.markNotificationAsRead(
      currentUser.id,
      input.notificationId,
    );
  }
}
