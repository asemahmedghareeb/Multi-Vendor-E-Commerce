import { Request } from 'express';
import { FileAuthGuardStrategy } from '../file-auth-guard.strategy';
import { AppHttpException } from 'src/common/exceptions/app-http.exception';
import { ErrorCodeEnum } from 'src/common/enums/error-code.enum';
import { Injectable } from '@nestjs/common';
import { GuardHelperService } from 'src/modules/core/app-helper/services/guard-helper.service';

@Injectable()
export class TestFileAuthGuard implements FileAuthGuardStrategy {
  constructor(private readonly guardHelperService: GuardHelperService) {}

  async canActivate(request: Request): Promise<boolean> {
    const session =
      await this.guardHelperService.validateUserSessionByRequest(request);
    // throw new AppHttpException(ErrorCodeEnum.UNAUTHORIZED);
    return true;
  }
}
