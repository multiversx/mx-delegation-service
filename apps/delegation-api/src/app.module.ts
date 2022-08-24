import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggerInterceptor } from './interceptors/logger-interceptor';
import { InfoModule } from './modules/info/info.module';
import { DelegationModule } from './modules/delegation/delegation.module';
import { ProvidersModule } from './modules/providers/providers.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ServicesModule } from './common/services';
import { ApiMetricsModule } from './common/services/metrics/api.metrics.module';
import { LoggingModule } from './logging.module';
import './utils/extentions';

@Module({
  imports: [
    LoggingModule,
    ScheduleModule.forRoot(),
    InfoModule,
    ProvidersModule,
    DelegationModule,
    ServicesModule,
    ApiMetricsModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggerInterceptor,
    },
    LoggerInterceptor,
  ],
})
export class AppModule {}
