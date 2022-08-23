import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { catchError, map, tap } from 'rxjs/internal/operators';
import { CacheManagerService } from '../common/services/cache-manager/cache-manager.service';

@Injectable()
export class LongTermCacheInterceptor implements NestInterceptor {

  constructor(
    private cacheManagerService: CacheManagerService
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
        const cachedValue = await this.cacheManagerService.getLongTermCache('LONGTERM.' + request.url);
        return cachedValue ?? null;
      }),
    );
  }
}
