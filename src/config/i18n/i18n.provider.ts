import { Injectable, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { I18nResolver } from 'nestjs-i18n';
import { AppGqlContext } from 'src/common/types/gql-context.type';

@Injectable()
export class HeaderResolver implements I18nResolver {
  // The resolve method determines the user's preferred language based on the execution context.
  resolve(context: ExecutionContext) {
    // Check if the context is an HTTP request.
    if (context.getType() == 'http') {
      // Extract the 'lang' property from the HTTP request headers.
      return context.switchToHttp().getRequest().lang;
    }

    // If the context is a GraphQL request, create a GraphQL execution context.
    const ctx = GqlExecutionContext.create(context);

    // Extract the 'lang' property from the GraphQL context.
    const { lang } = ctx.getContext() as AppGqlContext;

    // Return the resolved language.
    return lang;
  }
}
