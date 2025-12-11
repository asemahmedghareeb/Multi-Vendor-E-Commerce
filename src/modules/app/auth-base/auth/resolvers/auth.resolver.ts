import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Transactional } from 'typeorm-transactional';
import { AuthService } from '../services/auth.service';
import { VerifyUserInput } from '../dtos/inputs/verify-user-email.input';
import { LoginUserWithPasswordInput } from '../dtos/inputs/login-user-with-password.input';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { User } from '../../user/entities/user.entity';
import { CurrentSession } from 'src/common/decorators/current-session.decorator';
import { Session } from '../../session/entities/session.entity';
import { ManualRegisterWithPasswordInput } from '../dtos/inputs/manual-register-user-with-password.input';
import { ResetUserPasswordInput } from '../dtos/inputs/reset-user-password.input';
import { LoginUserWithEmailVerificationCodeInput } from '../dtos/inputs/login-user-with-email-verification-code.input';
import { LoginUserWithPhoneNumberVerificationCodeInput } from '../dtos/inputs/login-user-with-phone-number-verification-code.input';
import { SocialRegisterUserInput } from 'src/modules/app/auth-base/auth/dtos/inputs/social-register-user.input';
import { AppHttpException } from 'src/common/exceptions/app-http.exception';
import { ErrorCodeEnum } from 'src/common/enums/error-code.enum';
import { SocialLoginInput } from '../dtos/inputs/social-login.input';
import { Auth } from 'src/common/decorators/auth.decorator';
import { ChangeUserPasswordInput } from '../dtos/inputs/change-user-password.input';
import {
  VerificationCodeBaseInput,
  VerificationCodeInput,
} from '../dtos/inputs/verification-code.input';
import { LinkSocialAccountInput } from '../dtos/inputs/link-social-account.input';
import { UnlinkUserSocialAccountInput } from '../dtos/inputs/unlink-user-social-account.input';
import { UserLoginOptionsResponse } from '../dtos/responses/user-login-options.response';
import { GetUserLoginOptions } from '../dtos/inputs/get-user-login-options.input';
import { RegisterSocialAccountForExistingUser } from '../dtos/inputs/register-social-account-for-existing-user.input';
import { ReplaceSocialAccountInput } from '../dtos/inputs/replace-social-account.input';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}
  //** --------------------- QUERIES --------------------- */
  @Query(() => User)
  @Auth({
    allowUsersWithRequireSettingPassword: true,
    allowUsersWithRequireCompleteProfileInfo: true,
  })
  me(@CurrentUser() user: User, @CurrentSession() session: Session) {
    return user;
  }

  @Query(() => UserLoginOptionsResponse)
  getUserLoginOptions(@Args() input: GetUserLoginOptions) {
    return this.authService.getUserLoginOptions(input.emailOrPhoneNumber);
  }

  //** --------------------- MUTATIONS --------------------- */
  @Mutation(() => User)
  @Transactional()
  registerUser(@Args('input') input: ManualRegisterWithPasswordInput) {
    return this.authService.registerUser(input);
  }

  @Mutation(() => User)
  @Transactional()
  socialRegisterUser(@Args('input') input: SocialRegisterUserInput) {
    return this.authService.socialRegisterUser(input);
  }

  @Mutation(() => User)
  @Transactional()
  verifyUserEmail(@Args('input') input: VerifyUserInput) {
    return this.authService.verifyUserEmail(input);
  }

  @Mutation(() => User)
  @Transactional()
  verifyUserPhoneNumber(@Args('input') input: VerifyUserInput) {
    return this.authService.verifyUserPhoneNumber(input);
  }

  @Mutation(() => User)
  @Transactional()
  loginUserWithPassword(@Args('input') input: LoginUserWithPasswordInput) {
    return this.authService.loginUserWithPassword(input);
  }

  @Mutation(() => User)
  @Transactional()
  loginUserWithEmailVerificationCode(
    @Args('input') input: LoginUserWithEmailVerificationCodeInput,
  ) {
    return this.authService.loginUserWithEmailVerificationCode(input);
  }

  @Mutation(() => User)
  @Transactional()
  loginUserWithPhoneNumberVerificationCode(
    @Args('input') input: LoginUserWithPhoneNumberVerificationCodeInput,
  ) {
    return this.authService.loginUserWithPhoneNumberVerificationCode(input);
  }

  @Mutation(() => User)
  @Transactional()
  loginUserWithSocialAccount(@Args('input') input: SocialLoginInput) {
    return this.authService.socialLoginUser(input);
  }

  @Mutation(() => Boolean)
  @Transactional()
  resetUserPassword(@Args('input') input: ResetUserPasswordInput) {
    return this.authService.restUserPassword(input);
  }

  @Mutation(() => Boolean)
  @Transactional()
  @Auth({
    allowUsersWithRequireSettingPassword: true,
  })
  changeUserPassword(
    @CurrentUser() user: User,
    @Args('input') input: ChangeUserPasswordInput,
  ) {
    return this.authService.changeUserPassword(user, input);
  }

  @Mutation(() => Boolean)
  @Transactional()
  @Auth()
  updateUserEmail(
    @CurrentUser() user: User,
    @Args() input: VerificationCodeInput,
  ) {
    return this.authService.updateUserEmail(user, input.code);
  }

  @Mutation(() => Boolean)
  @Transactional()
  @Auth()
  updateUserPhoneNumber(
    @CurrentUser() user: User,
    @Args() input: VerificationCodeInput,
  ) {
    return this.authService.updateUserPhoneNumber(user, input.code);
  }

  @Mutation(() => Boolean)
  @Transactional()
  @Auth()
  linkSocialAccount(
    @CurrentUser() user: User,
    @Args('input') input: LinkSocialAccountInput,
  ) {
    return this.authService.linkSocialAccount(user, input);
  }

  @Mutation(() => Boolean)
  @Transactional()
  @Auth()
  unlinkSocialAccount(
    @CurrentUser() user: User,
    @Args() input: UnlinkUserSocialAccountInput,
  ) {
    return this.authService.unlinkSocialAccount(user, input.socialProvider);
  }

  @Mutation(() => User)
  @Transactional()
  registerSocialAccountForExistingUser(
    @Args('input') input: RegisterSocialAccountForExistingUser,
  ) {
    return this.authService.registerSocialAccountForExistingUser(input);
  }

  @Mutation(() => User)
  @Transactional()
  replaceSocialAccount(@Args('input') input: ReplaceSocialAccountInput) {
    return this.authService.replaceSocialAccount(input);
  }

  @Mutation(() => Boolean)
  @Transactional()
  @Auth()
  logoutUser(@CurrentSession() currentSession: Session) {
    if (!currentSession) throw new AppHttpException(ErrorCodeEnum.UNAUTHORIZED);
    return this.authService.logoutUser(currentSession);
  }

  //** ------------------ RESOLVE FIELDS ------------------ */
}
