import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request } from 'express';
import { ContextService } from 'src/modules/core/context/context.service';

@Injectable()
export class LangContextMiddleware implements NestMiddleware {
  constructor(private readonly contextService: ContextService) {}

  use(req: Request & { lang?: string }, res: Response, next: NextFunction) {
    req.lang = this.contextService.getLang(req);
    next();
  }
}
