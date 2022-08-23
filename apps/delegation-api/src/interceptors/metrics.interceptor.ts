import { CallHandler, ExecutionContext, HttpStatus, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { MetricsService } from '../common/services/metrics/metrics.service';
import { PerformanceProfiler } from '../utils/performance.profiler';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  private readonly logger: Logger

  constructor(
    private readonly metricsService: MetricsService,
  ) {
    this.logger = new Logger(MetricsInterceptor.name);
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const apiFunction = context.getClass().name + '.' + context.getHandler().name;

    const profiler = new PerformanceProfiler(apiFunction);

    return next
      .handle()
      .pipe(
        tap((result) => {
          profiler.stop();

          const http = context.switchToHttp();
          const res = http.getResponse();

          if (result !== undefined) {
            this.metricsService.setApiCall(apiFunction, res.statusCode, profiler.duration, JSON.stringify(result).length);
          } else {
            this.metricsService.setApiCall(apiFunction, res.statusCode, profiler.duration, 0);
          }
        }),
        catchError(err => {
          profiler.stop();

          const statusCode = err.status ?? HttpStatus.INTERNAL_SERVER_ERROR;
          this.metricsService.setApiCall(apiFunction, statusCode, profiler.duration, 0);
          
          return throwError(() => err);
        })
      );
  }
}