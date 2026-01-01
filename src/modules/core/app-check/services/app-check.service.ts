import { Injectable } from '@nestjs/common';
import * as fireBaseAdmin from 'firebase-admin';
import { ConfigService } from '@nestjs/config';
import { AppHttpException } from 'src/common/exceptions/app-http.exception';
import { ErrorCodeEnum } from 'src/common/enums/error-code.enum';

@Injectable()
export class AppCheckService {
  constructor(private readonly configService: ConfigService) {
    if (!fireBaseAdmin.apps.length) {
      fireBaseAdmin.initializeApp({
        credential: fireBaseAdmin.credential.cert({
          projectId: this.configService.get<string>('FIREBASE_PROJECT_ID'),
          clientEmail: this.configService.get<string>('FIREBASE_CLIENT_EMAIL'),
          privateKey: this.configService.get<string>('FIREBASE_PRIVATE_KEY'),
        }),
      });
    }
  }

  async validateToken(token: string) {
    try {
      const claims = await fireBaseAdmin.appCheck().verifyToken(token, {
        consume: true,
      });

      if (claims.alreadyConsumed) {
        throw new AppHttpException(ErrorCodeEnum.FORBIDDEN, {
          message: 'Already consumed FireBaseAppCheckToken',
        });
      }

      return claims;
    } catch (err) {
      if (err instanceof AppHttpException) throw err;

      throw new AppHttpException(ErrorCodeEnum.FORBIDDEN, {
        message: 'failed to validate X-Firebase-AppCheck',
      });
    }
  }
}
