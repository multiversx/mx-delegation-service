import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Inject } from '@nestjs/common';
import { catchError, map, Observable } from 'rxjs';
import { CacheManagerService } from '../common/services/cache-manager/cache-manager.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class LongTermCacheInterceptor implements NestInterceptor {

  constructor(
    private cacheManagerService: CacheManagerService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    return next.handle().pipe(
      map(async val => {
          if (!val) {
            const cachedValue = await this.cacheManagerService.getLongTermCache('LONGTERM.' + request.url);
            return cachedValue ?? val;
          } else {
            await this.cacheManagerService.setLongTermCache('LONGTERM.' + request.url, val);
            return val;
          }
        }
      ),
      catchError(async err => {
        this.logger.error('Error getting long term cache', {
          path: 'long-term-cache.interceptor.intercept',
          exception: err.toString(),
        });

        const cachedValue = await this.cacheManagerService.getLongTermCache('LONGTERM.' + request.url);
        return cachedValue ?? null;
      }),
    );
  }
}
