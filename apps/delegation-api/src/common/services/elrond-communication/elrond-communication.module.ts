import { Module } from '@nestjs/common';
import { ElrondElasticService } from './elrond-elastic.service';
import { ElrondApiService } from './elrond-api.service';
import { ElrondProxyService } from './elrond-proxy.service';
import { RedisModule } from 'nestjs-redis';
import { KeyBaseService } from './keybase.service';
import { CacheManagerModule } from '../cache-manager/cache-manager.module';
import { LoggingModule } from '../../../logging.module';
import { HttpModule } from '../http';

@Module({
  providers: [
    ElrondElasticService,
    ElrondApiService,
    ElrondProxyService,
    KeyBaseService,
  ],
  imports: [
    RedisModule.register({
      db: parseInt(process.env.REDIS_DB),
      password: process.env.REDIS_PASSWORD,
      keyPrefix: process.env.REDIS_PREFIX,
      sentinels: [{
        host: process.env.SENTINEL_URL,
        port: parseInt(process.env.SENTINEL_PORT),
      }],
      name: process.env.SENTINEL_NAME,
    }),
    CacheManagerModule,
    LoggingModule,
    HttpModule,
  ],
  exports: [
    ElrondElasticService,
    ElrondApiService,
    ElrondProxyService,
    KeyBaseService,
  ],
})
export class ElrondCommunicationModule {}
