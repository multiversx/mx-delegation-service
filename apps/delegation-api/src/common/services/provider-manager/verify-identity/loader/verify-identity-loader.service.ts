import { Injectable, Logger } from "@nestjs/common";
import { cacheConfig } from "../../../../../config";
import { CacheManagerService } from "../../../cache-manager/cache-manager.service";
import { AssetsService } from "../../../assets/assets.service";

@Injectable()
export class VerifyIdentityLoaderService {
  private readonly logger: Logger;
  constructor(
    private readonly cacheManagerService: CacheManagerService,
    private readonly assetsService: AssetsService,
  ) {
    this.logger = new Logger(VerifyIdentityLoaderService.name);
  }

  async load(identity: string): Promise<boolean> {
    const cached = await this.cacheManagerService.get<boolean>(this.getCacheKey(identity));
    if (cached != null) {
      return cached;
    }

    const verified = this.getRaw(identity);

    const ttl = verified ? cacheConfig.verifyIdentity.verified : cacheConfig.verifyIdentity.standard;
    await this.cacheManagerService.set(this.getCacheKey(identity), verified, ttl);

    return verified;
  }

  async getRaw(identity: string): Promise<boolean> {
    try {
      const info = await this.assetsService.getIdentityInfo(identity);
      if (info == null) {
        return false;
      }

      const keys = info.owners;

      this.logger.log(`github.com validation: for identity '${identity}', found ${keys.length} keys`);

      return true;
    } catch (error) {
      this.logger.log(`Error when verifying keybase against github for identity '${identity}'`);
      this.logger.error(error);
      return false;
    }
  }

  private getCacheKey(identity: string): string {
    return `${VerifyIdentityLoaderService.name}.identity:${identity}`;
  }
}
