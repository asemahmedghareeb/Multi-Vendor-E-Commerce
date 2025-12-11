import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { LangEnum } from 'src/common/enums/lang.enum';
import { AppConfig } from 'src/config/app.config';
import { SmsMessageEnum } from '../enum/sms-message.enum';
import { AppHelperService } from '../../app-helper/services/app-helper.service';
import { AppHttpException } from 'src/common/exceptions/app-http.exception';
import { ErrorCodeEnum } from 'src/common/enums/error-code.enum';
import { SmsStrategyEnum } from '../enum/sms-strategy.enum';

@Injectable()
export class SmsService {
  constructor(
    @InjectQueue('sms-queue') private readonly smsQueue: Queue,
    private readonly appHelperServer: AppHelperService,
  ) {}

  sendSms(to: string, body: string, strategy: SmsStrategyEnum) {
    if (!AppConfig.allowSms)
      throw new AppHttpException(ErrorCodeEnum.NOT_IMPLEMENTED, {
        message: 'This app does not support sending sms messages.',
      });

    this.smsQueue.add('send-sms', {
      to,
      body,
      strategy
    });
  }

  sendLocalizedSms(
    to: string,
    message: SmsMessageEnum,
    context: {},
    lang: LangEnum = AppConfig.defaultLang,
    strategy: SmsStrategyEnum,
  ) {
    const body = this.appHelperServer.localize(`sms.${message}`, context, lang);

    this.sendSms(to, body, strategy);
  }
}
