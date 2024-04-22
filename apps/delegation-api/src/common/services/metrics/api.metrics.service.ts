import { MetricsService } from '@multiversx/sdk-nestjs-monitoring';
import { Injectable } from '@nestjs/common';
import { register, Histogram, Gauge } from 'prom-client';

@Injectable()
export class ApiMetricsService {

  private static apiResponseSizeHistogram: Histogram<string>;
  private static transactionProcessorLastNonceGauge: Gauge<string>;

  constructor(
    private readonly metricsService: MetricsService,
  ) {
    if (!ApiMetricsService.apiResponseSizeHistogram) {
      ApiMetricsService.apiResponseSizeHistogram = new Histogram({
        name: 'api_response_size',
        help: 'API Response size',
        labelNames: ['endpoint'],
        buckets: [],
      });
    }

    if (!ApiMetricsService.transactionProcessorLastNonceGauge) {
      ApiMetricsService.transactionProcessorLastNonceGauge = new Gauge({
        name: 'transaction_processor_last_nonce',
        help: 'Transaction Processor Last Processed Nonce',
        labelNames: ['shardId'],
      });
    }

  }

  setTransactionProcessorLastNonce(shardId: number, nonce: number): void {
    ApiMetricsService.transactionProcessorLastNonceGauge.set(
      {
        shardId,
      },
      nonce,
    );
  }

  async getMetrics(): Promise<string> {
    const baseMetrics = await this.metricsService.getMetrics();
    const currentMetrics = await register.metrics();
    return baseMetrics + `\n` + currentMetrics;
  }
}
