import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { catchError, Observable, tap } from 'rxjs';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { UserActivity } from '../entities/user-activity.entity';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AppGqlContext } from 'src/common/types/gql-context.type';
import { AppConfig } from 'src/config/app.config';

@Injectable()
export class MonitoringInterceptor implements NestInterceptor {
  constructor(
    @InjectQueue('monitoring-queue')
    private readonly monitoringQueue: Queue<Partial<UserActivity>>,
  ) {}

  private monitor(
    mutationName: string,
    startDate: Date,
    gqlContext: AppGqlContext,
    err?: HttpException,
  ) {
    const endDate = new Date();
    this.monitoringQueue.add('monitoring-job', {
      mutationName,
      success: err ? false : true,
      code: err ? err.getStatus() || 500 : 200,
      executionTime: endDate.getTime() - startDate.getTime(),
      sessionId: gqlContext.session?.id,
      ip: gqlContext.ip,
    });
  }

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> {
    if (context.getType() === 'http' || !AppConfig.monitorUserActivity) {
      return next.handle();
    }

    const ctx = GqlExecutionContext.create(context);

    const ctxInfo = ctx.getInfo();

    if (ctxInfo.operation.operation != 'mutation') {
      return next.handle();
    }

    const gqlContext: AppGqlContext = ctx.getContext();

    const startDate = new Date();
    return next.handle().pipe(
      tap((data) => {
        this.monitor(ctxInfo.fieldName, startDate, gqlContext);
      }),
      catchError((err) => {
        this.monitor(ctxInfo.fieldName, startDate, gqlContext, err);
        throw err;
      }),
    );
  }
}
