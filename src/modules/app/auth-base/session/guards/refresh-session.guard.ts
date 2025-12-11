import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { InjectAppRepository } from 'src/common/decorators/inject-app-repository.decorator';
import { AppGqlContext } from 'src/common/types/gql-context.type';
import { AppJwtService } from 'src/modules/core/app-jwt/services/app-jwt.service';
import { Session } from '../entities/session.entity';
import { AppRepository } from 'src/modules/core/app-database/repositories/app.repository';
import { AppHttpException } from 'src/common/exceptions/app-http.exception';
import { ErrorCodeEnum } from 'src/common/enums/error-code.enum';

@Injectable()
export class RefreshSessionGuard implements CanActivate {
  constructor(
    private readonly appJwtService: AppJwtService,
    @InjectAppRepository(Session)
    private readonly sessionRepository: AppRepository<Session>,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const gqlContext: AppGqlContext = ctx.getContext();
    if (!gqlContext.token)
      throw new AppHttpException(ErrorCodeEnum.UNAUTHORIZED);

    const payload = this.appJwtService.validateRefreshToken(gqlContext.token);

    if (!payload) throw new AppHttpException(ErrorCodeEnum.UNAUTHORIZED);

    const { sessionId, exp } = payload;

    const session = await this.sessionRepository.findOne({
      where: { id: sessionId, refreshExpiryDate: new Date(exp * 1000) },
    });

    if (!session) throw new AppHttpException(ErrorCodeEnum.UNAUTHORIZED);

    gqlContext.session = session;

    return true;
  }
}
