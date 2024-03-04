import { Injectable } from "@nestjs/common";
import { AssetsService } from "../../assets/assets.service";
import { readdir } from "fs/promises";
import { CacheManagerService } from "../../cache-manager/cache-manager.service";
import { cacheConfig } from "../../../../config";
import { AddressUtils } from "@elrondnetwork/erdnest";

@Injectable()
export class IdentitiesLoaderService {
  constructor(
    private readonly assetsService: AssetsService,
    private readonly cacheManagerService: CacheManagerService,
  ) { }

  async refreshAll(): Promise<void> {
    const distinctIdentities = await this.getDistictIdentities();

    for (const identity of distinctIdentities) {
      const identityInfo = this.assetsService.getIdentityInfo(identity);
      if (!identityInfo) {
        continue;
      }

      const owners = identityInfo.owners;
      for (const owner of owners) {
        if (!AddressUtils.isSmartContractAddress(owner)) {
          continue;
        }

        await this.cacheManagerService.set(this.getCacheKey(owner), identity, cacheConfig.getMetaData.verified);
      }
    }
  }

  async loadByOwner(owner: string): Promise<string | null> {
    return await this.cacheManagerService.get<string>(this.getCacheKey(owner));
  }

  private async getDistictIdentities(): Promise<string[]> {
    const dirContents = await readdir(this.assetsService.getIdentityAssetsPath(), { withFileTypes: true });

    const identities = dirContents
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    return identities;
  }

  private getCacheKey(owner: string): string {
    return `${IdentitiesLoaderService.name}.owner.${owner}`;
  }
}
