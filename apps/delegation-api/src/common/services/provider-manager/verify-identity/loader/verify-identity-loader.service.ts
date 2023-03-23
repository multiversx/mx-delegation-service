import { Injectable, Logger } from "@nestjs/common";
import { cacheConfig } from "../../../../../config";
import { CacheManagerService } from "../../../cache-manager/cache-manager.service";
import { GithubService } from "../../profile/github/github.service";

@Injectable()
export class VerifyIdentityLoaderService {
  private readonly logger: Logger;
  constructor(
    private readonly cacheManagerService: CacheManagerService,
    private readonly githubService: GithubService,
  ) {
    this.logger = new Logger(VerifyIdentityLoaderService.name);
  }

  async load(identity: string): Promise<boolean> {
    const cached = await this.cacheManagerService.get<boolean>(this.getCacheKey(identity));
    if (cached != null) {
      return cached;
    }

    const verified = await this.getRaw(identity);

    const ttl = verified ? cacheConfig.verifyIdentity.verified : cacheConfig.verifyIdentity.standard;
    await this.cacheManagerService.set(this.getCacheKey(identity), verified, ttl);

    return verified;
  }

  private async getRaw(identity: string): Promise<boolean> {
    try {
      const [elrondResults, multiversxResults] = await Promise.all([
        this.githubService.getRepoContent(identity, 'elrond', 'keys.json'),
        this.githubService.getRepoContent(identity, 'multiversx', 'keys.json'),
      ]);

      if (!elrondResults && !multiversxResults) {
        return false;
      }

      const keys = multiversxResults ? JSON.parse(multiversxResults) : JSON.parse(elrondResults);

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
