import { Injectable } from '@nestjs/common';
import { InjectAppRepository } from 'src/common/decorators/inject-app-repository.decorator';
import { AdminGroup } from 'src/modules/app/auth-base/admin-group/entities/admin-group.entity';
import { AppRepository } from '../../app-database/repositories/app.repository';
import { User } from 'src/modules/app/auth-base/user/entities/user.entity';
import { AppHttpException } from 'src/common/exceptions/app-http.exception';
import { PermissionOptions } from 'src/common/types/allowed-permission.type';
import { ErrorCodeEnum } from 'src/common/enums/error-code.enum';
import { AppJwtConfig } from 'src/config/app-jwt/app-jwt.config';
import { ContextService } from '../../context/context.service';
import { Session } from 'src/modules/app/auth-base/session/entities/session.entity';
import { Request } from 'express';

@Injectable()
export class GuardHelperService {
  constructor(
    private readonly contextService: ContextService,
    @InjectAppRepository(AdminGroup)
    private readonly adminGroupRepository: AppRepository<AdminGroup>,
  ) {}

  async validateUserHasPermission(
    user: User,
    requiredPermissions: PermissionOptions[],
    exception: AppHttpException,
  ) {
    if (!user.adminGroupId) throw exception;

    const userGroup = await this.adminGroupRepository.findOne({
      where: {
        id: user.adminGroupId,
      },
      relations: {
        adminGroupPermissions: {
          permission: true,
        },
      },
    });

    const userPermissionsVis: Record<string, boolean> = {};

    userGroup?.adminGroupPermissions.forEach(({ permission }) => {
      userPermissionsVis[permission.code] = true;
    });

    requiredPermissions.forEach((requiredPermission) => {
      if (
        !userPermissionsVis[
          `${requiredPermission.target}.${requiredPermission.action}`
        ]
      )
        throw exception;
    });
  }

  validateIsExpiredSession(accessTokenExpiredAt: Date) {
    const expiredAt = accessTokenExpiredAt.getTime();
    const startedAt = expiredAt - AppJwtConfig.accessTokenExpireIn;
    const refreshExpireAt = startedAt + AppJwtConfig.refreshTokenExpireIn;
    if (refreshExpireAt > Date.now())
      throw new AppHttpException(ErrorCodeEnum.EXPIRED_ACCESS_TOKEN);
  }

  async validateUserSessionByRequest(req: Request) {
    let session: Session | null | undefined;
    let accessTokenExpiredAt: Date | undefined;

    try {
      session = await this.contextService.getSession(req);
    } catch (error) {
      if (error.name == 'TokenExpiredError')
        accessTokenExpiredAt = error.expiredAt;
    }

    if (accessTokenExpiredAt) {
      this.validateIsExpiredSession(accessTokenExpiredAt);
    }

    if (!session) throw new AppHttpException(ErrorCodeEnum.UNAUTHORIZED);

    return session;
  }
}
