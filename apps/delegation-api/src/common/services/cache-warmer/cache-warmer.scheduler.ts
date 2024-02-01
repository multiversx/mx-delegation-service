import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CacheWarmerService } from './cache-warmer.service';
import { AssetsService } from '../assets/assets.service';

@Injectable()
export class CacheWarmerScheduler {
  constructor(
    private readonly cacheWarmerService: CacheWarmerService,
    private readonly assetsService: AssetsService,
  ) {
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  async maintainStakingContractDeployedContracts() {
    await this.cacheWarmerService.cacheStakingContractDeployedContracts();
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  async checkoutAssetsRepo() {
    await this.assetsService.checkout();
  }
}
