import { ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ThrottlerGuard, ThrottlerLimitDetail } from '@nestjs/throttler';
import { AppHttpException } from '../exceptions/app-http.exception';
import { ErrorCodeEnum } from '../enums/error-code.enum';

@Injectable()
export class AppThrottlerGuard extends ThrottlerGuard {
  public async canActivate(context: ExecutionContext): Promise<boolean> {
    if (context.getType<'graphql'>() === 'graphql') {
      const gqlCtx = GqlExecutionContext.create(context);
      if (gqlCtx.getInfo().operation.operation === 'subscription') {
        return true;
      }
    }
    return super.canActivate(context);
  }

  protected getRequestResponse(context: ExecutionContext) {
    if (context.getType() === 'http') {
      const request = context.switchToHttp().getRequest();
      const response = context.switchToHttp().getResponse();
      return { req: request, res: response };
    }
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    return { req: request, res: ctx.getContext().res };
  }

  protected async throwThrottlingException(
    context: ExecutionContext,
    limit: ThrottlerLimitDetail,
  ): Promise<void> {
    throw new AppHttpException(ErrorCodeEnum.TOO_MANY_REQUESTS);
  }
}
