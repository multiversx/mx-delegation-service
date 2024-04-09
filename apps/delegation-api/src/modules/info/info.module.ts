import { Module } from '@nestjs/common';
import { InfoController } from './info.controller';
import { InfoService } from './info.service';
import * as redisStore from 'cache-manager-ioredis';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    CacheModule.register({
      ttl: 1800, // cache for 30 minutes,
      store: redisStore,
      db: process.env.REDIS_DB,
      password: process.env.REDIS_PASSWORD,
      prefix: process.env.REDIS_PREFIX,
      sentinels: [{
        host: process.env.SENTINEL_URL,
        port: parseInt(process.env.SENTINEL_PORT),
      }],
      name: process.env.SENTINEL_NAME,
    }),
  ],
  controllers: [InfoController],
  providers: [InfoService],
})
export class InfoModule { }
