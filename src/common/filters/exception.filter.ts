import {
  ArgumentsHost,
  Catch,
  ContextType,
  ExceptionFilter,
  HttpException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { AppHttpException } from '../exceptions/app-http.exception';
import { GqlArgumentsHost } from '@nestjs/graphql';
import { AppGqlContext } from '../types/gql-context.type';
import { GraphQLError } from 'graphql';
import { Request, Response } from 'express';
import { ErrorCodeEnum } from '../enums/error-code.enum';
import { AppHelperService } from 'src/modules/core/app-helper/services/app-helper.service';
import { LangEnum } from '../enums/lang.enum';

@Catch()
export class AppExceptionFilter implements ExceptionFilter {
  constructor(private readonly appHelperService: AppHelperService) {}

  private handleGqlException(exception: AppHttpException, host: ArgumentsHost) {
    Logger.error(exception.message, exception.stack);

    if (!(exception instanceof AppHttpException)) {
      exception = new AppHttpException(ErrorCodeEnum.SERVER_SIDE_ERROR);
    }
    const gqlHost = GqlArgumentsHost.create(host);
    const currentGqlCtx: AppGqlContext = gqlHost.getContext();
    const message = this.appHelperService.localize(
      `errors.${exception.message}`,
      {},
      currentGqlCtx.lang,
    );

    return new GraphQLError(message, {
      extensions: {
        code: ErrorCodeEnum[exception.getStatus()],
        status: exception.getStatus(),
        timestamp: Date.now(),
        ...exception.extensions,
      },
    });
  }

  catch(exception: AppHttpException, host: ArgumentsHost) {
    if (exception instanceof NotFoundException) {
      exception = new AppHttpException(exception.getStatus());
    }

    if (!(exception instanceof AppHttpException)) {
      Logger.error(exception);

      exception = new AppHttpException(500);
    }

    if (host.getType() == ('graphql' as ContextType)) {
      return this.handleGqlException(exception, host);
    }

    const httpHost = host.switchToHttp();
    const response: Response = httpHost.getResponse();
    const request: Request = httpHost.getRequest();
    const lang = request.headers.lang as LangEnum;
    const message = this.appHelperService.localize(
      `errors.${exception.message}`,
      {},
      Object.values(LangEnum).includes(lang as LangEnum) ? lang : undefined,
    );
    return response.status(exception.getStatus()).send({
      message,
      code: exception.getStatus(),
      extension: exception.extensions,
    });
  }
}
