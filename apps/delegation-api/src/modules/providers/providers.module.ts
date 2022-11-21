import { Module } from '@nestjs/common';
import { ProvidersController } from './providers.controller';
import { CacheManagerModule } from '../../common/services/cache-manager/cache-manager.module';
import { ProvidersService } from './providers.service';
import { ElrondCommunicationModule } from '../../common/services/elrond-communication/elrond-communication.module';
import { ProviderManagerModule } from '../../common/services/provider-manager/provider-manager.module';
import { DelegationAprService } from '../delegation/delegation-apr.service';
import { ServicesModule } from '../../common/services';
import { ProvidersControllerV2 } from './providers-v2.controller';

@Module({
  controllers: [ProvidersController, ProvidersControllerV2],
  providers: [
    ProvidersService,
    DelegationAprService,
  ],
  imports: [
    CacheManagerModule,
    ElrondCommunicationModule,
    ProviderManagerModule,
    ServicesModule,
  ],
  exports: [
    ProvidersService,
  ],
})
export class ProvidersModule {}
