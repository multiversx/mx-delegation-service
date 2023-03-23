import { Module } from '@nestjs/common';
import { ElrondCommunicationModule } from '../elrond-communication/elrond-communication.module';
import { ProviderManagerService } from './provider-manager.service';
import { CacheManagerModule } from '../cache-manager/cache-manager.module';
import { VerifyIdentityModule } from './verify-identity/verify-identity.module';
import { GetProfileLoaderModule } from './get-profile/loader/get-profile-loader.module';

@Module({
  providers: [
    ProviderManagerService,
  ],
  imports: [
    ElrondCommunicationModule,
    CacheManagerModule,
    GetProfileLoaderModule,
  ],
  exports: [
    ProviderManagerService,
  ],
})
export class ProviderManagerModule { }
