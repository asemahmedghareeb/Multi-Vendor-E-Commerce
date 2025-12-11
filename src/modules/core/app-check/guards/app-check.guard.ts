import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AppCheckService } from '../services/app-check.service';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ErrorCodeEnum } from 'src/common/enums/error-code.enum';
import { AppHttpException } from 'src/common/exceptions/app-http.exception';
import { Request } from 'express';

@Injectable()
export class AppCheckGuard implements CanActivate {
  constructor(private readonly appCheckService: AppCheckService) {}
  private getRequest(context: ExecutionContext) {
    if (context.getType() === 'http') {
      const request = context.switchToHttp().getRequest();
      return request;
    }
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    return request;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = this.getRequest(context) as Request;

    const token = request.headers['x-firebase-appcheck'];

    if (!token) {
      throw new AppHttpException(ErrorCodeEnum.FORBIDDEN, {
        message: 'X-Firebase-AppCheck does not exist',
      });
    }

    await this.appCheckService.validateToken(token as string);
    
    return true;
  }
}
