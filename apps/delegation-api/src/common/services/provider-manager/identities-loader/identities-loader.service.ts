import { Injectable, Logger } from "@nestjs/common";
import { AssetsService } from "../../assets/assets.service";
import { readdir } from "fs/promises";
import { CacheManagerService } from "../../cache-manager/cache-manager.service";
import { cacheConfig } from "../../../../config";
import { AddressUtils } from "@multiversx/sdk-nestjs-common";

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

    for (const identity of distinctIdentities) {
      this.logger.log(`Refreshing identity ${identity}`);
      const identityInfo = this.assetsService.getIdentityInfo(identity);
      this.logger.log(`Identity info ${identity}`, {
        identityInfo,
      });

      const owners = identityInfo.owners;
      if (owners == null) {
        this.logger.warn(`Identity ${identity} has no owners`);
        continue;
      }

      for (const owner of owners) {
        if (!AddressUtils.isSmartContractAddress(owner)) {
          this.logger.warn(`Addess ${owner} is not smart contract`);
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
