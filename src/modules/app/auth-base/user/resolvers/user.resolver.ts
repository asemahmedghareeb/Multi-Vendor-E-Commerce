import {
  Args,
  Mutation,
  Parent,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { User } from '../entities/user.entity';
import { UserService } from '../services/user.service';
import { Transactional } from 'typeorm-transactional';
import { Auth } from 'src/common/decorators/auth.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { UpdateUserInfo } from '../dtos/inputs/update-user-info.input';
import { UserRoleEnum } from 'src/common/enums/user-role.enum';
import {
  AdminCustomPermissionActions,
  CustomPermissionsTargetsEnum,
} from '../../admin-group/consts/custom-permissions.const';
import { RegisterAdminInput } from '../dtos/inputs/register-admin.input';
import { AdminGroup } from '../../admin-group/entities/admin-group.entity';
import { AdminGroupDataloader } from '../dataloaders/admin-group.dataloader';
import { CompleteUserProfileInfoInput } from '../dtos/inputs/complete-user-profile-info.input';

@Resolver(() => User)
export class UserResolver {
  constructor(
    private readonly userService: UserService,
    private readonly adminGroupDataloader: AdminGroupDataloader,
  ) {}

  @Mutation(() => Boolean)
  @Transactional()
  @Auth()
  updateUserInfo(
    @CurrentUser() currentUser: User,
    @Args('input') input: UpdateUserInfo,
  ) {
    return this.userService.updateUserInfo(currentUser, input);
  }

  @Mutation(() => Boolean)
  @Transactional()
  @Auth({
    allowUsersWithRequireCompleteProfileInfo: true,
    allowUsersWithRequireSettingPassword: true,
  })
  completeUserProfileInfo(
    @CurrentUser() currentUser: User,
    @Args('input') input: CompleteUserProfileInfoInput,
  ) {
    return this.userService.completeUserProfileInfo(currentUser, input);
  }

  @Mutation(() => Boolean)
  @Transactional()
  @Auth({
    roles: [UserRoleEnum.ADMIN],
    permissions: [
      {
        target: CustomPermissionsTargetsEnum.REGISTER_ADMIN,
        action: AdminCustomPermissionActions.REGISTER_ADMIN,
      },
    ],
  })
  adminCreateAdmin(@Args('input') input: RegisterAdminInput) {
    return this.userService.createAdminUser(input);
  }

  @ResolveField(() => AdminGroup, { nullable: true })
  adminGroup(@Parent() user: User, @CurrentUser() currentUser: User) {
    if (!user.adminGroupId) return;

    if (user.id != currentUser.id) return;

    const loader = this.adminGroupDataloader.getDataloader();

    return loader.load(user.adminGroupId);
  }

  //todo resolve filed to serialize unneeded data
}
