import { Module } from '@nestjs/common';
import { ElrondCommunicationModule } from '../elrond-communication/elrond-communication.module';
import { ProviderManagerService } from './provider-manager.service';
import { CacheManagerModule } from '../cache-manager/cache-manager.module';

@Module({
  providers: [
    ProviderManagerService,
  ],
  imports: [
    ElrondCommunicationModule,
    CacheManagerModule,
  ],
  exports: [
    ProviderManagerService,
  ],
})
export class ProviderManagerModule {}
