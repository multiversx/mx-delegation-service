import { Injectable, Logger } from "@nestjs/common";
import { cacheConfig } from "../../../../../config";
import { CacheManagerService } from "../../../cache-manager/cache-manager.service";
import { GithubUserInfo } from "../../../github/entities/github.user.info";
import { GithubService } from "../../../github/github.service";

@Injectable()
export class GetProfileLoaderService {
  private readonly logger: Logger;
  constructor(
    private readonly githubService: GithubService,
    private readonly cacheManagerService: CacheManagerService
  ) {
    this.logger = new Logger(GetProfileLoaderService.name);
  }

  async load(identity: string): Promise<GithubUserInfo | undefined> {
    const cached = await this.cacheManagerService.get<GithubUserInfo>(this.getCacheKey(identity));
    if (cached != null) {
      return cached;
    }

    const raw = await this.getRaw(identity);
    await this.cacheManagerService.set(this.getCacheKey(identity), raw, cacheConfig.getProfile);

    return raw;
  }

  private async getRaw(identity: string): Promise<GithubUserInfo | undefined> {
    try {
      return await this.githubService.getUserInfo(identity);
    } catch (error) {
      this.logger.error(`Unexpected error when getting profile from github`, {
        identity,
        error,
      });
    }
  }

  private getCacheKey(identity: string): string {
    return `${GetProfileLoaderService.name}.identity:${identity}`;
  }
}
