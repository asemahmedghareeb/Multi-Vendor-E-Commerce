import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { RequestUserVerificationCodeInput } from '../dtos/inputs/request-user-verification-code.input';
import { Transactional } from 'typeorm-transactional';
import { RequestResetUserPasswordVerificationCodeInput } from '../dtos/inputs/request-reset-user-password-verification-code.input';
import { RequestLoginWithEmailVerificationCodeInput } from '../dtos/inputs/request-login-with-email-verification-code.input';
import { RequestLoginWithPhoneNumberVerificationCodeInput } from '../dtos/inputs/request-login-with-phone-number-verification-code.input';
import { Auth } from 'src/common/decorators/auth.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { User } from '../entities/user.entity';
import { RequestUpdateEmailVerificationCodeInput } from '../dtos/inputs/request-update-email-verification-code.input';
import { UserVerificationCode } from '../entities/user-verification-code.entity';
import { RequestUpdatePhoneNumberVerificationCodeInput } from '../dtos/inputs/request-update-phone-number-verification-code.input';
import { RequestVerificationService } from '../services/request-verification-code.service';

@Resolver(() => UserVerificationCode)
export class UserVerificationCodeResolver {
  constructor(
    private readonly requestVerificationCodeService: RequestVerificationService,
  ) {}

  //** --------------------- QUERIES --------------------- */
  //** --------------------- MUTATIONS --------------------- */
  @Mutation(() => Boolean)
  @Transactional()
  async requestVerifyUserEmailVerificationCode(
    @Args() input: RequestUserVerificationCodeInput,
  ) {
    return this.requestVerificationCodeService.requestVerifyUserEmailVerificationCode(
      input,
    );
  }

  @Mutation(() => Boolean)
  @Transactional()
  async requestVerifyUserPhoneNumberVerificationCode(
    @Args() input: RequestUserVerificationCodeInput,
  ) {
    return this.requestVerificationCodeService.requestVerifyUserPhoneNumberVerificationCode(
      input,
    );
  }

  @Mutation(() => Boolean)
  @Transactional()
  async requestLoginUserVerificationCodeWithEmail(
    @Args() input: RequestLoginWithEmailVerificationCodeInput,
  ) {
    return this.requestVerificationCodeService.requestLoginUserVerificationCodeWithEmail(
      input,
    );
  }

  @Mutation(() => Boolean)
  @Transactional()
  async requestLoginUserVerificationCodeWithPhoneNumber(
    @Args() input: RequestLoginWithPhoneNumberVerificationCodeInput,
  ) {
    return this.requestVerificationCodeService.requestLoginUserVerificationCodeWithPhoneNumber(
      input,
    );
  }

  @Mutation(() => Boolean)
  @Transactional()
  @Auth()
  async requestUpdateUserEmailVerificationCode(
    @CurrentUser() currentUser: User,
    @Args() input: RequestUpdateEmailVerificationCodeInput,
  ) {
    return this.requestVerificationCodeService.requestUpdateUserEmailVerificationCode(
      currentUser,
      input,
    );
  }

  @Mutation(() => Boolean)
  @Transactional()
  @Auth()
  async requestUpdateUserPhoneNumberVerificationCode(
    @CurrentUser() currentUser: User,
    @Args() input: RequestUpdatePhoneNumberVerificationCodeInput,
  ) {
    return this.requestVerificationCodeService.requestUpdateUserPhoneNumberVerificationCode(
      currentUser,
      input,
    );
  }

  @Mutation(() => Boolean)
  @Transactional()
  async requestResetUserPasswordVerificationCode(
    @Args() input: RequestResetUserPasswordVerificationCodeInput,
  ) {
    return this.requestVerificationCodeService.requestResetUserPasswordVerificationCode(
      input,
    );
  }
  //** ------------------ RESOLVE FIELDS ------------------ */
}
