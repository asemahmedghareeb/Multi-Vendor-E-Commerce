import { Request } from 'express';

export interface FileAuthGuardStrategy {
  canActivate(request: Request): boolean | Promise<boolean>;
}
