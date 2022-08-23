import { Controller, Get } from '@nestjs/common';
import { MetricsService } from '@elrondnetwork/erdnest';

@Controller()
export class ApiMetricsController {
  constructor(
    private readonly metricsService: MetricsService
  ) {}
  
  @Get('/metrics')
  getMetrics(): Promise<string> {
    return this.metricsService.getMetrics();
  }

}
