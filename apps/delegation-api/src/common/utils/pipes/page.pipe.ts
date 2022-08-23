import { Injectable, PipeTransform } from '@nestjs/common';
import { BadRequest } from '../../errors';

@Injectable()
export class PagePipe implements PipeTransform {
  transform(value: number): number {
    if (value < 1) {
      throw BadRequest.fromError({
        error: 'invalid_page',
        message: 'Invalid page',
      });
    }
    return value;
  }
}
