import { Module } from '@nestjs/common';
import { CacheWarmerService } from './cache-warmer.service';
import { ElrondCommunicationModule } from '../elrond-communication/elrond-communication.module';
import { CacheManagerModule } from '../cache-manager/cache-manager.module';
import { CacheWarmerScheduler } from './cache-warmer.scheduler';

@Module({
  providers: [
    CacheWarmerService,
    CacheWarmerScheduler,
  ],
  imports: [
    ElrondCommunicationModule,
    CacheManagerModule,
  ],
  exports: [
    CacheWarmerService,
  ],
})
export class CacheWarmerModule {}
