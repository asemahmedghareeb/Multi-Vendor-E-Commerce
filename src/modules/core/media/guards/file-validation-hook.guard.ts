import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';
import { ErrorCodeEnum } from 'src/common/enums/error-code.enum';
import { AppHttpException } from 'src/common/exceptions/app-http.exception';

@Injectable()
export class FillValidationHookGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  async canActivate(context: ExecutionContext) {
    const request: Request = context.switchToHttp().getRequest();

    const key = request.headers['x-api-key'];

    if (key != this.configService.get('LAMBDA_HOOK_API_KEY'))
      throw new AppHttpException(ErrorCodeEnum.UNAUTHORIZED);

    return true;
  }
}
