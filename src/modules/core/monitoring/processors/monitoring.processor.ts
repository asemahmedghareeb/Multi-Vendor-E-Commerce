import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { MonitoringService } from '../services/monitoring.service';
import { UserActivity } from '../entities/user-activity.entity';
import { Logger } from '@nestjs/common';

@Processor('monitoring-queue', {
  limiter: { duration: 3000, max: 10 },
})
export class MonitoringProcessor extends WorkerHost {
  constructor(private readonly monitoringService: MonitoringService) {
    super();
  }

  async process(job: Job<Partial<UserActivity>>): Promise<any> {
    try {
      await this.monitoringService.createUserActivity(job.data);
    } catch (err) {
      Logger.error(err);
      throw err;
    }
  }
}
