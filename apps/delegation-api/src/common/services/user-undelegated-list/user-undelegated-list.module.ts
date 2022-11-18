import { Module } from '@nestjs/common';
import { ElrondCommunicationModule } from '../elrond-communication/elrond-communication.module';
import { CacheManagerModule } from '../cache-manager/cache-manager.module';
import { UserUndelegatedListService } from './user-undelegated-list.service';

@Module({
  providers: [
    UserUndelegatedListService,
  ],
  imports: [
    ElrondCommunicationModule,
    CacheManagerModule,
  ],
  exports: [
    UserUndelegatedListService,
  ],
})
export class UserUndelegatedListModule {}
