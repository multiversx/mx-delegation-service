import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ServicesModule } from '../services.module';
import { TransactionProcessorService } from './transaction-processor.service';
import { CacheWarmerModule } from '../cache-warmer/cache-warmer.module';
import { MetricsModule } from '../metrics/metrics.module';
import { ProvidersModule } from '../../../modules/providers/providers.module';
import { PluginModule } from '../../../plugins/plugin.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ServicesModule,
    CacheWarmerModule,
    MetricsModule,
    ProvidersModule,
    PluginModule,
  ],
  providers: [
    TransactionProcessorService,
  ],
})
export class TransactionProcessorModule {}
