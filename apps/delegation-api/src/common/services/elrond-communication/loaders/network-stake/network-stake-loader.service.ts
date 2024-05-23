import { Injectable } from "@nestjs/common";
import { ElrondApiService } from "../../elrond-api.service";
import { CacheManagerService } from "../../../cache-manager/cache-manager.service";
import { MultiversXApiNetworkStake } from "../../models/network-stake.dto";
import { Constants } from "@multiversx/sdk-nestjs-common";

@Injectable()
export class NetworkStakeLoaderService {
  constructor(
    private readonly cacheManager: CacheManagerService,
    private readonly elrondApiService: ElrondApiService,
  ) { }


  async load(): Promise<MultiversXApiNetworkStake | undefined> {
    const cached = await this.cacheManager.get<MultiversXApiNetworkStake>(this.getCacheKey());
    if (cached != null) {
      return cached;
    }

    const networkStake = await this.elrondApiService.getNetworkStake();
    if (networkStake == null) {
      return;
    }

    await this.cacheManager.set(this.getCacheKey(), networkStake, Constants.oneMinute() * 10);

    return networkStake;
  }

  private getCacheKey(): string {
    return `${NetworkStakeLoaderService.name}.networkStake`;
  }
}
