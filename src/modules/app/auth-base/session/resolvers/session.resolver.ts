import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { AppJwtService } from 'src/modules/core/app-jwt/services/app-jwt.service';
import { SessionService } from '../services/session.service';
import { AppJwtToken } from 'src/common/types/app-jwt-token.type';
import { UseGuards } from '@nestjs/common';
import { RefreshSessionGuard } from '../guards/refresh-session.guard';
import { Session } from '../entities/session.entity';
import { CurrentSession } from 'src/common/decorators/current-session.decorator';
import { UpdateSessionInput } from '../dtos/inputs/update-session.input';
import { Auth } from 'src/common/decorators/auth.decorator';
import { User } from '../../user/entities/user.entity';
import { UserDataloader } from '../dataloaders/user.dataloader';

@Resolver(() => Session)
export class SessionResolver {
  constructor(
    private readonly appJwtService: AppJwtService,
    private readonly sessionService: SessionService,
    private readonly userDataloader: UserDataloader,
  ) {}

  @Query(() => Session)
  @Auth()
  currentSession(@CurrentSession() currentSession: Session) {
    return currentSession;
  }

  @Mutation(() => AppJwtToken)
  @UseGuards(RefreshSessionGuard)
  async refreshToken(@CurrentSession() currentSession: Session) {
    const session = await this.sessionService.refreshSession(currentSession);
    return this.appJwtService.generateAppJwtToken(
      session.id,
      session.accessExpiryDate,
      session.refreshExpiryDate,
    );
  }

  @Mutation(() => Boolean)
  @Auth()
  updateCurrentSession(
    @CurrentSession() session: Session,
    @Args('input') input: UpdateSessionInput,
  ) {
    return this.sessionService.updateSession(session, input);
  }

  @ResolveField(() => User)
  user(@Parent() session: Session) {
    if (session.user) return session.user;

    const loader = this.userDataloader.getDataloader();
    return loader.load(session.userId);
  }
}
