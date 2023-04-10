import { Module } from '@nestjs/common';
import { ElrondCommunicationModule } from '../elrond-communication/elrond-communication.module';
import { ProviderManagerService } from './provider-manager.service';
import { CacheManagerModule } from '../cache-manager/cache-manager.module';
import { ProfileLoaderModule } from './profile/loader/profile-loader.module';

@Module({
  providers: [
    ProviderManagerService,
  ],
  imports: [
    ElrondCommunicationModule,
    CacheManagerModule,
    ProfileLoaderModule,
  ],
  exports: [
    ProviderManagerService,
  ],
})
export class ProviderManagerModule { }
