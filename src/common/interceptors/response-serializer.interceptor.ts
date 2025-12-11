import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { map } from 'rxjs/operators';

@Injectable()
export class ResponseSerializerInterceptor<T> implements NestInterceptor<T> {
  constructor() {}

  intercept(context: ExecutionContext, next: CallHandler) {
    return next.handle().pipe(
      // TODO add logs
      // TODO add subscription support
      map((res) => {
        return res;
      }),
    );
  }
}
