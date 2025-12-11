import { ConfigService } from '@nestjs/config';
import { QueueOptions } from 'bullmq';

export const BullConfigFactory = async (
  configService: ConfigService,
): Promise<QueueOptions> => {
  return {
    connection: {
      host: configService.getOrThrow('REDIS_HOST'),
      port: configService.getOrThrow('REDIS_PORT'),
      password: configService.get('REDIS_PASSWORD'),
      db : configService.getOrThrow('REDIS_DB')
    },
    defaultJobOptions: {
      attempts: 3,
      removeOnComplete: 1000,
      removeOnFail: 3000,
      backoff: 3000,
    },
  };
};
