import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { SmsStrategy } from '../interfaces/sms-strategy.interface';

@Injectable()
export class SnsStrategy implements SmsStrategy {
  private snsClient: SNSClient;

  constructor(private configService: ConfigService) {
    this.snsClient = new SNSClient({
      region: configService.getOrThrow('AWS_REGION'),
      credentials: {
        accessKeyId: configService.getOrThrow('AWS_ACCESS_KEY'),
        secretAccessKey: configService.getOrThrow('AWS_SECRET_ACCESS_KEY'),
      },
    });
  }

  async sendSMS(to: string, body: string) {
    //TODO add logic here
  }
}
