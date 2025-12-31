import { Module } from '@nestjs/common';
import { CacheWarmerService } from './cache-warmer.service';
import { ElrondCommunicationModule } from '../elrond-communication/elrond-communication.module';
import { CacheManagerModule } from '../cache-manager/cache-manager.module';
import { CacheWarmerScheduler } from './cache-warmer.scheduler';
import { IdentitiesLoaderModule } from '../provider-manager/identities-loader/identities-loader.module';

@Module({
  imports: [
    ElrondCommunicationModule,
    CacheManagerModule,
    IdentitiesLoaderModule,
  ],
  providers: [
    CacheWarmerService,
    CacheWarmerScheduler,
  ],
  exports: [
    CacheWarmerService,
  ],
})
export class CacheWarmerModule { }
