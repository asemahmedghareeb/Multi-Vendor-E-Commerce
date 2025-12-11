import { Injectable } from '@nestjs/common';
import { MailTemplateEnum } from '../enums/mail-template.enum';
import * as fs from 'fs';
import * as path from 'path';
import * as Handlebars from 'handlebars';
import { LangEnum } from 'src/common/enums/lang.enum';
import { AppConfig } from 'src/config/app.config';

@Injectable()
export class MailAdapterService {
  constructor() {}

  compileTemplate(
    templateName: MailTemplateEnum,
    context: {},
    lang: LangEnum = AppConfig.defaultLang,
  ) {
    const templatePath = path.join(
      __dirname,
      '..',
      'templates',
      lang,
      templateName,
    );
    const source = fs.readFileSync(templatePath, 'utf-8');
    const template = Handlebars.compile(source);
    return template(context);
  }
}
