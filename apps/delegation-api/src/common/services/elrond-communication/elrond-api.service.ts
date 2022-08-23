import { ApiProvider, NetworkStake } from '@elrondnetwork/erdjs';
import { elrondConfig } from '../../../config';
import { Injectable } from '@nestjs/common';
import { CacheManagerService } from '../cache-manager/cache-manager.service';
import BigNumber from 'bignumber.js';

@Injectable()
export class ElrondApiService {
  private proxy: ApiProvider;
  constructor(private cacheManager: CacheManagerService) {
    this.proxy = new ApiProvider(
      elrondConfig.elrondApi,
      parseInt(process.env.KEEPALIVE_TIMEOUT_DOWNSTREAM)
    );
  }

  async getNetworkStake(): Promise<NetworkStake> {
    const cachedValue = await this.cacheManager.getNetworkStake();
    if (!!cachedValue) {
      const networkStake = new NetworkStake()
      networkStake.TotalValidators = Number(cachedValue.TotalValidators);
      networkStake.ActiveValidators = Number(cachedValue.ActiveValidators);
      networkStake.QueueSize = Number(cachedValue.QueueSize);
      networkStake.TotalStaked = new BigNumber(cachedValue.TotalStaked)
      return networkStake;
    }

    const result =  await this.proxy.getNetworkStake();
    await this.cacheManager.setNetworkStake({
      ...result,
      TotalStaked: result.TotalStaked.toString()
    });
    return result;
  }
}