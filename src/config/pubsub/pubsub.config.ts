import { RedisPubSub } from 'graphql-redis-subscriptions';
import Redis, { RedisOptions } from 'ioredis';
import { get } from 'env-var';

const options: RedisOptions = {
  host: get('REDIS_HOST').required().asString(),
  port: get('REDIS_PORT').required().asPortNumber(),
  db: get('REDIS_DB').default('0').asIntPositive(),
};

export const pubSub = new RedisPubSub({
  publisher: new Redis(options),
  subscriber: new Redis(options),
});
