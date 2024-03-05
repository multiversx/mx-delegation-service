import { elrondConfig } from '../../../config';
import { Injectable } from '@nestjs/common';
import { CacheManagerService } from '../cache-manager/cache-manager.service';
import BigNumber from 'bignumber.js';
import { ApiNetworkProvider, NetworkStake } from '@multiversx/sdk-network-providers';

@Injectable()
export class ElrondApiService {
  private proxy: ApiNetworkProvider;
  constructor(private cacheManager: CacheManagerService) {
    this.proxy = new ApiNetworkProvider(
      elrondConfig.elrondApi,
      {
        timeout: parseInt(process.env.KEEPALIVE_TIMEOUT_DOWNSTREAM),
      }
    );
  }

  async getNetworkStake(): Promise<NetworkStake> {
    const cachedValue = await this.cacheManager.getNetworkStake();
    if (!!cachedValue) {
      const networkStake = new NetworkStake();
      networkStake.TotalValidators = Number(cachedValue.TotalValidators);
      networkStake.ActiveValidators = Number(cachedValue.ActiveValidators);
      networkStake.QueueSize = Number(cachedValue.QueueSize);
      networkStake.TotalStaked = new BigNumber(cachedValue.TotalStaked);
      return networkStake;
    }

    const result = await this.proxy.getNetworkStakeStatistics();
    await this.cacheManager.setNetworkStake({
      ...result,
      TotalStaked: result.TotalStaked.toString(),
    });
    return result;
  }
}
