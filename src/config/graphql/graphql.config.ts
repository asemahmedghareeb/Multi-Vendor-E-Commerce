import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ModuleRef } from '@nestjs/core';
import { GqlOptionsFactory } from '@nestjs/graphql';
import { join } from 'path';
import { AppGqlContext } from 'src/common/types/gql-context.type';
import { Session } from 'src/modules/app/auth-base/session/entities/session.entity';
import { ContextService } from 'src/modules/core/context/context.service';

//TODO add all options
@Injectable()
export class GqlConfig implements GqlOptionsFactory {
  constructor(
    private readonly configService: ConfigService,
    private readonly contextService: ContextService,
    private readonly moduleRef: ModuleRef,
  ) {}

  createGqlOptions(): any {
    return {
      playground:
        this.configService.getOrThrow('NODE_ENV') == 'staging' ? true : false,
      introspection: true,
      autoSchemaFile: join(process.cwd(), 'schema.gql'),
      cache: 'bounded',
      persistedQueries: false,
      graphiql: true,
      csrfPrevention: true,
      includeStacktraceInErrorResponses: false,

      subscriptions: {
        'graphql-ws': {
          //todo add logic for auth
        },
      },

      context: async ({ req, res, extra }): Promise<AppGqlContext> => {
        let session: Session | null | undefined;
        let accessTokenExpiredAt: Date | undefined;

        try {
          session = await this.contextService.getSession(req);
        } catch (error) {
          if (error.name == 'TokenExpiredError')
            accessTokenExpiredAt = error.expiredAt;
        }

        return {
          req,
          res,
          lang: this.contextService.getLang(req),
          token: this.contextService.getToken(req),
          session,
          currentUser: session?.user,
          moduleRef: this.moduleRef,
          ip: req.ip,
          accessTokenExpiredAt,
        };
      },
    };
  }
}
