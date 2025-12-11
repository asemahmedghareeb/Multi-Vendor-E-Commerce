import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Twilio } from 'twilio';
import { SmsStrategy } from '../interfaces/sms-strategy.interface';

@Injectable()
export class WhatsappStrategy implements SmsStrategy {
  constructor(private configService: ConfigService) {}

  async sendSMS(to: string, body: string): Promise<any> {
    console.log('message sent to ' + to + ' : ' + body, 'whatsapp');
  }
}
