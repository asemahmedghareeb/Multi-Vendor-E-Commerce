import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Twilio } from 'twilio';
import { SmsStrategy } from '../interfaces/sms-strategy.interface';

@Injectable()
export class TwilioStrategy implements SmsStrategy {
  private twilioClient: Twilio;

  constructor(private configService: ConfigService) {
    const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');
    this.twilioClient = new Twilio(accountSid, authToken);
  }

  async sendSMS(to: string, body: string): Promise<any> {
    console.log('message sent to ' + to + ' : ' + body, 'twilio');

    return;
    await this.twilioClient.messages.create({
      body,
      from: this.configService.get<string>('TWILIO_SENDER_PHONE_ID'),
      to,
    });
  }
}
