import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { MailerStrategy } from '../interfaces/mailer.strategy';
import { Inject, Logger } from '@nestjs/common';
import { SesStrategy } from '../strategies/ses.strategy';
import { NodemailerStrategy } from '../strategies/nodemailer.strategy';

@Processor('mail-queue', {
  limiter: { duration: 3000, max: 10 },
})
export class MailProcessor extends WorkerHost {
  constructor(
    @Inject(NodemailerStrategy)
    private readonly mailerService: MailerStrategy,
  ) {
    super();
  }

  async process(job: Job): Promise<any> {
    try {
      await this.mailerService.sendEmail(job.data);
    } catch (err) {
      Logger.error(err);
      throw err;
    }
  }
}
