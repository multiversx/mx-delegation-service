import { Injectable, Logger } from "@nestjs/common";
import { cacheConfig } from "../../../../../config";
import { CacheManagerService } from "../../../cache-manager/cache-manager.service";
import { ProfileInfo } from "../common/models/profile.info";
import { GithubService } from "../github/github.service";
import { KeyBaseService } from "../keybase/keybase.service";

@Injectable()
export class ProfileLoaderService {
  private readonly logger: Logger;
  constructor(
    private readonly githubService: GithubService,
    private readonly keybaseService: KeyBaseService,
    private readonly cacheManagerService: CacheManagerService
  ) {
    this.logger = new Logger(ProfileLoaderService.name);
  }

  async load(identity: string): Promise<ProfileInfo | undefined> {
    const cached = await this.cacheManagerService.get<ProfileInfo>(this.getCacheKey(identity));
    if (cached != null) {
      return cached;
    }

    const raw = await this.getRaw(identity);
    if (raw != null) {
      await this.cacheManagerService.set(this.getCacheKey(identity), raw, cacheConfig.getProfile);
    }

    return raw;
  }

  private async getRaw(identity: string): Promise<ProfileInfo | undefined> {
    const githubIdentity = await this.getFromGithub(identity);
    if (githubIdentity == null) {
      return await this.getFromKeybase(identity);
    }

    return githubIdentity;
  }

  private async getFromGithub(identity: string): Promise<ProfileInfo | undefined> {
    try {
      const profile = await this.githubService.getUserInfo(identity);
      if (profile == null || profile.name == null || profile.avatar_url == null || profile.bio == null) {
        return null;
      }

      return profile;
    } catch (error) {
      this.logger.error(`Unexpected error when getting profile from github`, {
        identity,
        error,
      });
    }
  }

  private async getFromKeybase(identity: string): Promise<ProfileInfo | undefined> {
    try {
      const profile = await this.keybaseService.getProfile(identity);
      if (profile == null) {
        return;
      }

      const profileInfo = new ProfileInfo();
      profileInfo.name = profile.them?.profile?.full_name;
      profileInfo.avatar_url = profile.them?.pictures?.primary?.url;
      profileInfo.bio = profile.them?.profile?.bio;
      profileInfo.twitter_username = profile.them?.profile?.twitter;
      profileInfo.location = profile.them?.profile?.location;

      if (profile.them.proofs_summary.all) {
        for (const proof of profile.them.proofs_summary.all) {
          switch (proof.proof_type) {
            case 'twitter':
              profileInfo.twitter_username = proof.service_url;
              break;
            case 'dns':
            case 'generic_web_site':
              profileInfo.blog = proof.service_url;
              break;
          }
        }
      }

      return profileInfo;
    } catch (error) {
      this.logger.error(`Unexpected error when getting profile from keybase`, {
        identity,
        error,
      });
    }
  }

  private getCacheKey(identity: string): string {
    return `getProfile.${identity}`;
  }
}
