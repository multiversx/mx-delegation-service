import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CacheWarmerService } from './cache-warmer.service';
import { IdentitiesLoaderService } from '../provider-manager/identities-loader/identities-loader.service';

@Injectable()
export class CacheWarmerScheduler {
  constructor(
    private readonly cacheWarmerService: CacheWarmerService,
    private readonly identitiesLoaderService: IdentitiesLoaderService,
  ) {
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  async maintainStakingContractDeployedContracts() {
    await this.cacheWarmerService.cacheStakingContractDeployedContracts();
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  async refreshIdentities() {
    await this.identitiesLoaderService.refreshAll();
  }
}
