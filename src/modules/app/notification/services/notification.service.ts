import { Injectable } from '@nestjs/common';
import { AppRepository } from 'src/modules/core/app-database/repositories/app.repository';
import { Notification } from '../entities/notification.entity';
import { InjectAppRepository } from 'src/common/decorators/inject-app-repository.decorator';
import { SendNotificationInput } from '../dtos/inputs/send-notification.input';
import { User } from '../../auth-base/user/entities/user.entity';
import { In, MoreThanOrEqual } from 'typeorm';
import { AppHttpException } from 'src/common/exceptions/app-http.exception';
import { ErrorCodeEnum } from 'src/common/enums/error-code.enum';
import { NotificationReceiver } from '../entities/notification-receiver.entity';
import { Session } from '../../auth-base/session/entities/session.entity';
import { LangEnum } from 'src/common/enums/lang.enum';
import { NotificationPusherService } from 'src/modules/core/notification-pusher/services/notification-pusher.service';
import { PaginatorInput } from 'src/common/dtos/inputs/paginator.input';
import { SortDirectionEnum } from 'src/common/enums/sort-direction.enum';

@Injectable()
export class NotificationService {
  constructor(
    private readonly notificationPusherService: NotificationPusherService,
    @InjectAppRepository(Notification)
    private readonly notificationRepository: AppRepository<Notification>,
    @InjectAppRepository(User)
    private readonly userRepository: AppRepository<User>,
    @InjectAppRepository(NotificationReceiver)
    private readonly notificationReceiverRepository: AppRepository<NotificationReceiver>,
    @InjectAppRepository(Session)
    private readonly sessionRepository: AppRepository<Session>,
  ) {}

  async SendNotification(input: SendNotificationInput, UserSentBy?: User) {
    const receivers = await this.userRepository.find({
      where: {
        id: In(input.receiverUserIds),
      },
    });

    if (receivers.length != input.receiverUserIds.length) {
      throw new AppHttpException(ErrorCodeEnum.INVALID_USER_IDS);
    }

    const receiverFavLang = {};

    receivers.forEach(({ id, favLang }) => {
      receiverFavLang[id] = favLang;
    });

    const notification = await this.notificationRepository.createOne({
      ...input,
      sentByUserId: UserSentBy?.id,
    });

    await this.notificationReceiverRepository.bulkCreate(
      receivers.map(({ id: receiverUserId }) => {
        return {
          receiverUserId,
          notificationId: notification.id,
        };
      }),
    );

    if (!input.inAppOnly) {
      const sessions = await this.sessionRepository.find({
        where: {
          userId: In(input.receiverUserIds),
          allowNotifications: true,
          refreshExpiryDate: MoreThanOrEqual(new Date()),
        },
      });

      sessions.forEach((session) => {
        if (!session.lang) {
          session.lang = receiverFavLang[session.userId];
        }

        switch (session.lang) {
          case LangEnum.EN:
            this.notificationPusherService.sendNotification(
              session.notificationToken as string,
              notification.enTitle,
              notification.enBody,
              {
                ...notification.metadata,
                lang: session.lang,
                id: notification.id,
              },
            );
            break;
          case LangEnum.AR:
            this.notificationPusherService.sendNotification(
              session.notificationToken as string,
              notification.arBody,
              notification.arBody,
              {
                ...notification.metadata,
                lang: session.lang,
                id: notification.id,
              },
            );
            break;
        }
      });
    }

    return true;
  }

  async getUserNotifications(user: User, paginationInput?: PaginatorInput) {
    const notificationReceivers =
      await this.notificationReceiverRepository.findPaginated(
        {
          receiverUserId: user.id,
        },
        {
          notification: {
            createdAt: SortDirectionEnum.DESC,
          },
        },
        paginationInput?.page,
        paginationInput?.limit,
        {
          notification: true,
        },
      );

    return {
      pageInfo: notificationReceivers.pageInfo,
      items: notificationReceivers.items.map((notificationReceiver) => {
        notificationReceiver.notification.seenAt = notificationReceiver.seenAt;
        return notificationReceiver.notification;
      }),
    };
  }

  async markNotificationAsRead(userId: string, notificationId: string) {
    const notificationReceiver =
      await this.notificationReceiverRepository.findOne({
        where: {
          receiverUserId: userId,
          notificationId,
        },
      });

    if (!notificationReceiver) {
      throw new AppHttpException(
        ErrorCodeEnum.NOTIFICATION_RECEIVER_DOES_NOT_EXIST,
      );
    }

    if (notificationReceiver.seenAt) {
      throw new AppHttpException(
        ErrorCodeEnum.NOTIFICATION_ALREADY_MARKED_AS_SEEN,
      );
    }

    await this.notificationReceiverRepository.updateOneFromExistingModel(
      notificationReceiver,
      {
        seenAt: new Date(),
      },
    );

    return true;
  }
}
