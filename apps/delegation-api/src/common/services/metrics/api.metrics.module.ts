import { Module } from '@nestjs/common';
import { ElrondCommunicationModule } from '../elrond-communication/elrond-communication.module';
import { ApiMetricsService } from './api.metrics.service';
import { MetricsModule } from '@multiversx/sdk-nestjs-monitoring';

@Module({
  imports: [
    ElrondCommunicationModule,
    MetricsModule,
  ],
  providers: [
    ApiMetricsService,
  ],
  exports: [
    ApiMetricsService,
  ],
})
export class ApiMetricsModule { }
