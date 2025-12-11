import { Args, Query, Resolver } from '@nestjs/graphql';
import { SocialAuthService } from '../services/social-auth.service';
import { UserSocialLoginActionsEnum } from '../enums/user-social-login-actions.enum';
import { GetUserSocialLoginOptionsInput } from '../dtos/inputs/get-user-social-login-options.input';

@Resolver()
export class SocialAuthResolver {
  constructor(private readonly socialAuthService: SocialAuthService) {}

  @Query(() => UserSocialLoginActionsEnum)
  async getUserSocialLoginRequiredAction(
    @Args() input: GetUserSocialLoginOptionsInput,
  ) {
    return this.socialAuthService.getUserSocialLoginRequiredAction(
      input.socialProvider,
      input.token,
    );
  }
}
