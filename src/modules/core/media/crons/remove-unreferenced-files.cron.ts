import { Injectable, Logger } from '@nestjs/common';
import { MediaService } from '../services/media.service';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class RemoveUnreferencedFilesCron {
  constructor(private readonly mediaService: MediaService) {}

  @Cron('0 3 * * *')
  async handleCron() {
    try {
      await this.mediaService.removeUnReferencedFiles();
    } catch (err) {
      Logger.error(err);
    }
  }
}
