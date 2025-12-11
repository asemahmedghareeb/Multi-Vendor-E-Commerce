import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { SmsStrategy } from '../interfaces/sms-strategy.interface';
import { Inject, Logger } from '@nestjs/common';
import { TwilioStrategy } from '../strategies/twilio.strategy';
import { SmsStrategyEnum } from '../enum/sms-strategy.enum';

import { WhatsappStrategy } from '../strategies/whatsapp.strategy';

@Processor('sms-queue', {
  limiter: { duration: 3000, max: 10 },
})
export class SmsProcessor extends WorkerHost {
  constructor(
    @Inject(TwilioStrategy) private readonly smsStrategy: SmsStrategy,
    @Inject(WhatsappStrategy) private readonly whatsappStrategy: SmsStrategy,
  ) {
    super();
  }

  async process(job: Job): Promise<any> {
    try {
      switch (job.data.strategy as SmsStrategyEnum) {
        case SmsStrategyEnum.WHATSAPP:
          await this.whatsappStrategy.sendSMS(job.data.to, job.data.body);
          break;
        default:
          await this.smsStrategy.sendSMS(job.data.to, job.data.body);
      }
    } catch (err) {
      Logger.error(err);

      throw err;
    }
  }
}
