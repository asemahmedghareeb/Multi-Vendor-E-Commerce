import { Injectable } from '@nestjs/common';
import { MailTemplateEnum } from '../enums/mail-template.enum';
import { MailAdapterService } from './mail-adapter.service';
import { AppConfig } from 'src/config/app.config';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import Mail from 'nodemailer/lib/mailer';
import { LangEnum } from 'src/common/enums/lang.enum';
import { MailSubjectEnum } from '../enums/mail-subject.enum';
import { AppHelperService } from '../../app-helper/services/app-helper.service';
import { AppHttpException } from 'src/common/exceptions/app-http.exception';
import { ErrorCodeEnum } from 'src/common/enums/error-code.enum';

@Injectable()
export class MailService {
  constructor(
    @InjectQueue('mail-queue') private readonly mailQueue: Queue,
    private readonly mailAdapter: MailAdapterService,
    private readonly appHelperService: AppHelperService,
  ) {}

  sendEmailWithATemplate(
    to: string,
    subject: MailSubjectEnum,
    template: MailTemplateEnum,
    context: {},
    lang?: LangEnum,
  ) {
    if (!AppConfig.allowMail)
      throw new AppHttpException(ErrorCodeEnum.NOT_IMPLEMENTED, {
        message: 'This app does not support sending sending mails.',
      });

    const html = this.mailAdapter.compileTemplate(template, context, lang);
    this.mailQueue.add('send-email', {
      from: `"${AppConfig.AppName}" <${AppConfig.AppEmail}>`,
      to,
      subject: this.appHelperService.localize(
        `mail-subject.${subject}`,
        context,
        lang,
      ),
      html,
    } as Mail.Options);

  }

  sendEmailWithText(to: string, subject: string, text: string) {
    if (!AppConfig.allowMail)
      throw new AppHttpException(ErrorCodeEnum.NOT_IMPLEMENTED, {
        message: 'This app does not support sending sending mails.',
      });

    this.mailQueue.add('send-email', {
      from: `"${AppConfig.AppName}" <${AppConfig.AppEmail}>`,
      to,
      subject,
      text,
    } as Mail.Options);
  }
}
