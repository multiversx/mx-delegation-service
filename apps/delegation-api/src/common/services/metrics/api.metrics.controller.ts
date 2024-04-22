import { MetricsService } from '@multiversx/sdk-nestjs-monitoring';
import { Controller, Get } from '@nestjs/common';

@Controller()
export class ApiMetricsController {
  constructor(
    private readonly metricsService: MetricsService
  ) { }

  @Get('/metrics')
  getMetrics(): Promise<string> {
    return this.metricsService.getMetrics();
  }

}
