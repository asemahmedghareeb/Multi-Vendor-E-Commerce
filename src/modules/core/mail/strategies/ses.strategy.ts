import { Injectable } from '@nestjs/common';
import { MailerStrategy } from '../interfaces/mailer.strategy';
import { Mail } from '../types/mail.type';
import { ConfigService } from '@nestjs/config';
import { SendEmailCommand, SESClient } from '@aws-sdk/client-ses';
import { AppConfig } from 'src/config/app.config';

@Injectable()
export class SesStrategy implements MailerStrategy {
  private sesClient: SESClient;
  private fromEmail: string;

  constructor(private readonly configService: ConfigService) {
    this.sesClient = new SESClient({
      region: this.configService.getOrThrow('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.getOrThrow('AWS_ACCESS_KEY'),
        secretAccessKey: this.configService.getOrThrow('AWS_SECRET_ACCESS_KEY'),
      },
    });

    this.fromEmail = AppConfig.AppEmail;
  }

  async sendEmail(mailOptions: Mail): Promise<any> {
    const command = new SendEmailCommand({
      Source: `${AppConfig.AppName} <${this.fromEmail}>`,
      Destination: {
        ToAddresses: [mailOptions.to],
      },
      Message: {
        Subject: {
          Data: mailOptions.subject,
        },
        Body: {
          ...(mailOptions.html && {
            Html: {
              Data: mailOptions.html,
            },
          }),
          ...(mailOptions.text && {
            Text: {
              Data: mailOptions.text,
            },
          }),
        },
      },
    });

    await this.sesClient.send(command);

  }
}
