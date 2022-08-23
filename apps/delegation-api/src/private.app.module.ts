import { Module } from '@nestjs/common';
import { ApiMetricsController } from './common/services/metrics/api.metrics.controller';
import { ApiConfigModule } from './common/services/api-config/api.config.module';
import { ApiMetricsModule } from './common/services/metrics/api.metrics.module';


@Module({
  imports: [
    ApiConfigModule,
    ApiMetricsModule,
  ],
  controllers: [
    ApiMetricsController,
  ],
})
export class PrivateAppModule {}
