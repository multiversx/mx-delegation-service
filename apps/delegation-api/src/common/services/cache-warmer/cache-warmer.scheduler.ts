import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CacheWarmerService } from './cache-warmer.service';

@Injectable()
export class CacheWarmerScheduler {
  constructor(private readonly cacheWarmerService: CacheWarmerService) {
  }
  @Cron(CronExpression.EVERY_10_MINUTES)
  async maintainStakingContractDeployedContracts() {
    await this.cacheWarmerService.cacheStakingContractDeployedContracts();
  }
}
