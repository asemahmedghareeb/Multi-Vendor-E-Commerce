import { Request, Response } from 'express';
import { LangEnum } from '../enums/lang.enum';
import { Session } from 'src/modules/app/auth-base/session/entities/session.entity';
import { User } from 'src/modules/app/auth-base/user/entities/user.entity';
import { ModuleRef } from '@nestjs/core';

export type AppGqlContext = {
  req: Request;
  res: Response;
  lang: LangEnum;
  token?: string;
  session?: Session | null;
  currentUser?: User;
  moduleRef: ModuleRef;
  ip?: string | null;
  accessTokenExpiredAt?: Date | null;
};
