import { Module } from '@nestjs/common';
import { MetricsController } from './common/services/metrics/metrics.controller';
import { MetricsModule } from './common/services/metrics/metrics.module';
import { ApiConfigModule } from './common/services/api-config/api.config.module';


@Module({
  imports: [
    ApiConfigModule,
    MetricsModule
  ],
  controllers: [
    MetricsController,
  ],
})
export class PrivateAppModule {}
