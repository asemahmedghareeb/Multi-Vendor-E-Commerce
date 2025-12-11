import { Injectable } from '@nestjs/common';
import * as Nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { NodemailerTransportFactory } from 'src/config/node-mailer/transport.factory';
import { Mail } from '../types/mail.type';
import { MailerStrategy } from '../interfaces/mailer.strategy';

@Injectable()
export class NodemailerStrategy implements MailerStrategy {
  private transporter: Nodemailer.Transporter<
    SMTPTransport.SentMessageInfo,
    SMTPTransport.Options
  >;

  constructor() {
    this.transporter = NodemailerTransportFactory();
  }

  async sendEmail(mailOptions: Mail) {
    await this.transporter.sendMail(mailOptions);
  }
}
