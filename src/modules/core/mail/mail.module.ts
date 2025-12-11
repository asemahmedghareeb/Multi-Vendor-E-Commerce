import { Module } from '@nestjs/common';
import { MailService } from './services/mail.service';
import { NodemailerStrategy } from './strategies/nodemailer.strategy';
import { MailProcessor } from './processors/mail.processor';
import { BullModule } from '@nestjs/bullmq';
import { MailAdapterService } from './services/mail-adapter.service';
import { SesStrategy } from './strategies/ses.strategy';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'mail-queue',
    }),
  ],
  providers: [
    MailService,
    MailProcessor,
    MailAdapterService,
    NodemailerStrategy,
    SesStrategy,
  ],
  exports: [MailService],
})
export class MailModule {}
