import { Module } from '@nestjs/common';
import { ElrondCommunicationModule } from '../elrond-communication/elrond-communication.module';
import { ProviderManagerService } from './provider-manager.service';
import { CacheManagerModule } from '../cache-manager/cache-manager.module';
import { VerifyIdentityModule } from './verify-identity/verify-identity.module';

@Module({
  providers: [
    ProviderManagerService,
  ],
  imports: [
    ElrondCommunicationModule,
    CacheManagerModule,
    VerifyIdentityModule,
  ],
  exports: [
    ProviderManagerService,
  ],
})
export class ProviderManagerModule { }
