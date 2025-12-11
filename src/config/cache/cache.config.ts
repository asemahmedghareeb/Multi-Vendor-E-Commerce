import { createKeyv } from '@keyv/redis';
import { ConfigService } from '@nestjs/config';

export const cacheConfigFactory = async (configService: ConfigService) => ({
  stores: [
    createKeyv(
      `redis://:${configService.get('REDIS_PASSWORD')}@${configService.getOrThrow('REDIS_HOST')}:${configService.getOrThrow('REDIS_PORT')}/${configService.getOrThrow('REDIS_DB')}`,
    ),
  ],
  ttl: 60 * 3,
});
