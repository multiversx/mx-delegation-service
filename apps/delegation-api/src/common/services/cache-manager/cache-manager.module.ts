import { Module } from '@nestjs/common';
import { CacheManagerService } from './cache-manager.service';
import * as redisStore from 'cache-manager-ioredis';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  providers: [
    CacheManagerService,
  ],
  imports: [
    CacheModule.register({
      ttl: 60 * 5,
      store: redisStore,
      password: process.env.REDIS_PASSWORD,
      prefix: process.env.REDIS_PREFIX,
      sentinels: [{
        host: process.env.SENTINEL_URL,
        port: parseInt(process.env.SENTINEL_PORT),
      }],
      name: process.env.SENTINEL_NAME,
    }),

  ],
  exports: [
    CacheManagerService,
  ],
})
export class CacheManagerModule { }
