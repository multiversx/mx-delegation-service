import { Injectable, Logger } from "@nestjs/common";
import { AssetsService } from "../../assets/assets.service";
import { readdir } from "fs/promises";
import { CacheManagerService } from "../../cache-manager/cache-manager.service";
import { cacheConfig } from "../../../../config";
import { AddressUtils } from "@elrondnetwork/erdnest";

@Injectable()
export class IdentitiesLoaderService {
  private readonly logger: Logger;
  constructor(
    private readonly assetsService: AssetsService,
    private readonly cacheManagerService: CacheManagerService,
  ) {
    this.logger = new Logger(IdentitiesLoaderService.name);
  }

  async refreshAll(): Promise<void> {
    const distinctIdentities = await this.getDistictIdentities();
    console.log(`Distinct identities: ${distinctIdentities.length}`, {
      distinctIdentities,
    });

    for (const identity of distinctIdentities) {
      console.log(`Refreshing identity ${identity}`);
      const identityInfo = this.assetsService.getIdentityInfo(identity);
      console.log(`Identity info ${identity}`, {
        identityInfo,
      });
      const owners = identityInfo.owners;
      for (const owner of owners) {
        if (!AddressUtils.isSmartContractAddress(owner)) {
          console.log(`Addess ${owner} is not smart contract`);
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
