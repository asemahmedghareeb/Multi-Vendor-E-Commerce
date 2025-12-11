import { Injectable } from '@nestjs/common';
import { InjectAppRepository } from 'src/common/decorators/inject-app-repository.decorator';
import { LoginDeviceInput } from 'src/common/dtos/inputs/login-device.input';
import { Session } from '../entities/session.entity';
import { AppRepository } from 'src/modules/core/app-database/repositories/app.repository';
import { AppJwtConfig } from 'src/config/app-jwt/app-jwt.config';
import { AppHttpException } from 'src/common/exceptions/app-http.exception';
import { ErrorCodeEnum } from 'src/common/enums/error-code.enum';
import { User } from '../../user/entities/user.entity';
import { UpdateSessionInput } from '../dtos/inputs/update-session.input';

@Injectable()
export class SessionService {
  constructor(
    @InjectAppRepository(Session)
    private readonly sessionRepository: AppRepository<Session>,
  ) {}

  private async validateNotificationToken(notificationToken: string) {
    const existedSession = await this.sessionRepository.findOne({
      where: {
        notificationToken: notificationToken,
      },
    });

    if (existedSession?.expired)
      await this.sessionRepository.remove(existedSession);
    else if (existedSession)
      throw new AppHttpException(ErrorCodeEnum.BAD_REQUEST_EXCEPTION, {
        message: 'an active session with the same Notification token already exist.',
      });
  }

  private getSessionNewExpiryDates() {
    const now = new Date(Math.floor(new Date().getTime() / 1000) * 1000);

    const accessExpiryDate: Date = new Date(
      now.getTime() + AppJwtConfig.accessTokenExpireIn,
    );

    const refreshExpiryDate: Date = new Date(
      now.getTime() + AppJwtConfig.refreshTokenExpireIn,
    );

    return { accessExpiryDate, refreshExpiryDate };
  }

  async startSession(user: User, loginDeviceInput: LoginDeviceInput) {
    if (
      !loginDeviceInput.notificationToken &&
      loginDeviceInput.allowNotifications
    ) {
      throw new AppHttpException(ErrorCodeEnum.NOT_PROVIDED_NOTIFICATION_TOKEN);
    }

    if (loginDeviceInput.notificationToken)
      await this.validateNotificationToken(loginDeviceInput.notificationToken);

    const { accessExpiryDate, refreshExpiryDate } =
      this.getSessionNewExpiryDates();

    const session = await this.sessionRepository.createOne({
      userId: user.id,
      accessExpiryDate,
      refreshExpiryDate,
      lang: loginDeviceInput.deviceLang,
      ...loginDeviceInput,
    });

    return session;
  }

  async refreshSession(session: Session) {
    const { accessExpiryDate, refreshExpiryDate } =
      this.getSessionNewExpiryDates();

    await this.sessionRepository.updateOneFromExistingModel(session, {
      accessExpiryDate,
      refreshExpiryDate,
    });

    return session;
  }

  async updateSession(session: Session, input: UpdateSessionInput) {
    if (
      !session.notificationToken &&
      input.allowNotifications &&
      !input.notificationToken
    ) {
      throw new AppHttpException(ErrorCodeEnum.NOT_PROVIDED_NOTIFICATION_TOKEN);
    }

    await this.sessionRepository.updateOneFromExistingModel(session, input);

    return true;
  }
}
