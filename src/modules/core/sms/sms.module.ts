import { Module } from '@nestjs/common';
import { SmsProcessor } from './processors/sms.processor';
import { SmsService } from './services/sms.service';
import { TwilioStrategy } from './strategies/twilio.strategy';
import { BullModule } from '@nestjs/bullmq';
import { SnsStrategy } from './strategies/sns.strategy';
import { WhatsappStrategy } from './strategies/whatsapp.strategy';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'sms-queue',
    }),
  ],
  providers: [
    SmsProcessor,
    SmsService,
    TwilioStrategy,
    SnsStrategy,
    WhatsappStrategy,
  ],
  exports: [SmsService],
})
export class SmsModule {}
