import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { get } from 'env-var';
import { NodeMailerProviderEnum } from 'src/common/enums/mail-provider';

export const NodeMailerOptions: {
  [key in NodeMailerProviderEnum]: SMTPTransport.Options;
} = {
  GMAIL: {
    service: 'gmail',
    auth: {
      user: get('APP_EMAIL').required().asString(),
      pass: get('GOOGLE_APP_PASSWORD').required().asString(),
    },
  },
};
