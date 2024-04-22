import { Module } from '@nestjs/common';
import { DelegationController } from './delegation.controller';
import { ElrondCommunicationModule } from '../../common/services/elrond-communication/elrond-communication.module';
import { DelegationService } from './delegation.service';
import { CacheManagerModule } from '../../common/services/cache-manager/cache-manager.module';
import { ProvidersModule } from '../providers/providers.module';
import * as redisStore from 'cache-manager-ioredis';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  controllers: [DelegationController],
  providers: [
    DelegationService,
  ],
  imports: [
    ElrondCommunicationModule,
    CacheManagerModule,
    ProvidersModule,
    CacheModule.register({
      ttl: 30, // default cache to 30 seconds. it will be overridden when needed
      store: redisStore,
      prefix: process.env.REDIS_PREFIX,
      sentinels: [{
        host: process.env.SENTINEL_URL,
        port: parseInt(process.env.SENTINEL_PORT),
      }],
      name: process.env.SENTINEL_NAME,
    }),
  ],
  exports: [
    DelegationService,
  ],
})
export class DelegationModule { }
