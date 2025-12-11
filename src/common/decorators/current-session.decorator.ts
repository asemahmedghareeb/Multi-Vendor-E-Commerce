import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AppGqlContext } from '../types/gql-context.type';
import { Session } from 'src/modules/app/auth-base/session/entities/session.entity';

export const CurrentSession = createParamDecorator(
  (
    _data: unknown,
    executionContext: ExecutionContext,
  ): Session | undefined | null => {
    const context = GqlExecutionContext.create(executionContext);
    const gqlContext: AppGqlContext = context.getContext();
    return gqlContext.session;
  },
);
