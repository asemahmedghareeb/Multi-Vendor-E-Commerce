import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { User } from 'src/modules/app/auth-base/user/entities/user.entity';
import { AppGqlContext } from '../types/gql-context.type';

export const CurrentUser = createParamDecorator(
  (_data: unknown, executionContext: ExecutionContext): User | undefined => {
    const context = GqlExecutionContext.create(executionContext);
    const gqlContext: AppGqlContext = context.getContext();
    return gqlContext.currentUser;
  },
);
