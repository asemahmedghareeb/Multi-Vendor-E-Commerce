import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { FileModelEnum } from '../enums/file-model.enum';
import { FileGuardOptions } from '.';
import { FileAuthGuardStrategy } from './file-auth-guard.strategy';
import { AppHttpException } from 'src/common/exceptions/app-http.exception';
import { ErrorCodeEnum } from 'src/common/enums/error-code.enum';
import { ModuleRef } from '@nestjs/core';

@Injectable()
export class FileAuthGuard implements CanActivate {
  constructor(private readonly moduleRef: ModuleRef) {}

  async canActivate(context: ExecutionContext) {
    const request: Request = context.switchToHttp().getRequest();

    const queryParams = request.params;
    const model = queryParams['model'];

    if (!FileGuardOptions[model as FileModelEnum]) {
      throw new AppHttpException(ErrorCodeEnum.NOT_FOUND);
    }

    const GuardClass = FileGuardOptions[model as FileModelEnum];
    const guard = this.moduleRef.get<FileAuthGuardStrategy>(GuardClass);

    return guard.canActivate(request);
  }
}
