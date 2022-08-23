import { Injectable } from '@nestjs/common';
import { register, Histogram, collectDefaultMetrics, Gauge } from 'prom-client';

@Injectable()
export class MetricsService {
  
  private static apiCallsHistogram: Histogram<string>;
  private static apiResponseSizeHistogram: Histogram<string>;
  private static isDefaultMetricsRegistered = false;
  private static transactionProcessorLastNonceGauge: Gauge<string>;

  constructor () {
    if (!MetricsService.apiCallsHistogram) {
      MetricsService.apiCallsHistogram = new Histogram({
        name: 'api',
        help: 'API Calls',
        labelNames: [ 'endpoint', 'code' ],
        buckets: [ ]
      });
    }

    if (!MetricsService.apiResponseSizeHistogram) {
      MetricsService.apiResponseSizeHistogram = new Histogram({
        name: 'api_response_size',
        help: 'API Response size',
        labelNames: [ 'endpoint' ],
        buckets: [ ]
      });
    }

    if (!MetricsService.transactionProcessorLastNonceGauge) {
      MetricsService.transactionProcessorLastNonceGauge = new Gauge({
        name: 'transaction_processor_last_nonce',
        help: 'Transaction Processor Last Processed Nonce',
        labelNames: [ 'shardId' ]
      });
    }
    
    if (!MetricsService.isDefaultMetricsRegistered) {
      MetricsService.isDefaultMetricsRegistered = true;
      collectDefaultMetrics();
    }
  }

  setApiCall(endpoint: string, status: number, duration: number, responseSize: number) {
    MetricsService.apiCallsHistogram.labels(endpoint, status.toString()).observe(duration);
    MetricsService.apiResponseSizeHistogram.labels(endpoint).observe(responseSize);
  }

  setTransactionProcessorLastNonce(shardId: number, nonce: number): void {
    MetricsService.transactionProcessorLastNonceGauge.set(
      {
        shardId
      },
      nonce,
    );
  }

  async getMetrics(): Promise<string> {
    return register.metrics();
  }
}