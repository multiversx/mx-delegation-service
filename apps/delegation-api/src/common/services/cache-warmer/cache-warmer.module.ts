import { Module } from '@nestjs/common';
import { CacheWarmerService } from './cache-warmer.service';
import { ElrondCommunicationModule } from '../elrond-communication/elrond-communication.module';
import { CacheManagerModule } from '../cache-manager/cache-manager.module';
import { CacheWarmerScheduler } from './cache-warmer.scheduler';
import { UserUndelegatedListModule } from '../user-undelegated-list/user-undelegated-list.module';
import { ProviderManagerModule } from '../provider-manager/provider-manager.module';

@Module({
  providers: [
    CacheWarmerService,
    CacheWarmerScheduler,
  ],
  imports: [
    ElrondCommunicationModule,
    CacheManagerModule,
    UserUndelegatedListModule,
    ProviderManagerModule,
  ],
  exports: [
    CacheWarmerService,
  ],
})
export class CacheWarmerModule {}
