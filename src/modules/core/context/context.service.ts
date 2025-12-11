import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { LangEnum } from 'src/common/enums/lang.enum';
import { AppConfig } from 'src/config/app.config';
import { AppJwtService } from '../app-jwt/services/app-jwt.service';
import { InjectAppRepository } from 'src/common/decorators/inject-app-repository.decorator';
import { Session } from 'src/modules/app/auth-base/session/entities/session.entity';
import { AppRepository } from '../app-database/repositories/app.repository';

@Injectable()
export class ContextService {
  constructor(
    private readonly appJwtService: AppJwtService,
    @InjectAppRepository(Session)
    private readonly sessionRepository: AppRepository<Session>,
  ) {}

  getLang(req: Request): LangEnum {
    let lang = <string>req?.headers?.lang;
    if (!lang || !Object.values(LangEnum).includes(lang as LangEnum))
      lang = AppConfig.defaultLang;
    return lang === 'en' ? LangEnum.EN : LangEnum.AR;
  }

  getToken(req: Request) {
    const authHeader = (req.headers['authorization'] ||
      req.headers['Authorization']) as string;
      
    if (!authHeader || !authHeader.startsWith('Bearer ')) return;
    return authHeader.split(' ')[1];
  }

  async getSession(req: Request) {
    const accessToken = this.getToken(req);
    if (!accessToken) return;

    const payload = this.appJwtService.validateAccessToken(accessToken);
    if (!payload) return;

    const { sessionId } = payload;
    const session = await this.sessionRepository.findOne({
      where: {
        id: sessionId,
        accessExpiryDate: new Date(payload.exp * 1000),
      },
      relations: {
        user: true,
      },
    });

    return session;
  }
}
