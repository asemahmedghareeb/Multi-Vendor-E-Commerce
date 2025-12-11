import * as Nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { NodeMailerOptions } from './node-mailer.options';
import { NodeMailerProviderEnum } from 'src/common/enums/mail-provider';

export const NodemailerTransportFactory = (): Nodemailer.Transporter<
  SMTPTransport.SentMessageInfo,
  SMTPTransport.Options
> => {
  return Nodemailer.createTransport(
    NodeMailerOptions[NodeMailerProviderEnum.GMAIL],
  );
};
