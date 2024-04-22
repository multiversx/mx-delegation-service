import { Injectable, Logger } from "@nestjs/common";
import { CacheManagerService } from "../../../cache-manager/cache-manager.service";
import { ProfileInfo } from "../common/models/profile.info";
import { KeyBaseService } from "../keybase/keybase.service";
import { AssetsService } from "../../../assets/assets.service";
import { Constants } from "@multiversx/sdk-nestjs-common";

@Injectable()
export class ProfileLoaderService {
  private readonly logger: Logger;
  constructor(
    private readonly keybaseService: KeyBaseService,
    private readonly cacheManagerService: CacheManagerService,
    private readonly assetsService: AssetsService,
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
      await this.cacheManagerService.set(this.getCacheKey(identity), raw, Constants.oneMinute() * 15);
    }

    return raw;
  }

  private async getRaw(identity: string): Promise<ProfileInfo | undefined> {
    identity = identity.trim();
    const githubIdentity = this.getFromGithub(identity);
    if (githubIdentity == null) {
      return await this.getFromKeybase(identity);
    }

    return githubIdentity;
  }

  private getFromGithub(identity: string): ProfileInfo | undefined {
    try {
      const identityInfo = this.assetsService.getIdentityInfo(identity);
      if (identityInfo == null || identityInfo.name == null) {
        this.logger.warn(`Identity ${identity} not found in Github`, {
          identity,
          identityInfo,
        });
        return;
      }

      return {
        username: identity,
        name: identityInfo.name,
        bio: identityInfo.description,
        avatar_url: `https://raw.githubusercontent.com/multiversx/mx-assets/master/identities/${identity}/logo.png`,
        twitter_username: identityInfo.twitter,
        location: identityInfo.location,
        blog: identityInfo.website,
      };
    } catch (error) {
      this.logger.error(`Unexpected error when getting profile from github`, {
        identity,
        error: error.code,
      });
    }
  }

  private async getFromKeybase(identity: string): Promise<ProfileInfo | undefined> {
    try {
      const data = await this.keybaseService.getProfile(identity);
      if (data == null) {
        this.logger.warn(`Identity ${identity} not found in Keybase`, {
          identity,
        });
        return;
      }

      if (data.status.code !== 0) {
        this.logger.warn(`Identity ${identity} not found in Keybase`, {
          identity,
        });
        return;
      }

      const { profile, pictures, basics } = data.them;

      const { proofs_summary } = data.them || {};
      const { all } = proofs_summary || {};

      const twitter = all.find((element: any) => element['proof_type'] === 'twitter');
      const website = all.find(
        (element: any) => element['proof_type'] === 'dns' || element['proof_type'] === 'generic_web_site'
      );

      return {
        username: basics.username,
        name: profile && profile.full_name ? profile.full_name : undefined,
        bio: profile && profile.bio ? profile.bio : undefined,
        avatar_url:
          pictures && pictures.primary && pictures.primary.url ? pictures.primary.url : undefined,
        twitter_username: twitter && twitter.service_url ? twitter.service_url : undefined,
        blog: website && website.service_url ? website.service_url : undefined,
        location: profile && profile.location ? profile.location : undefined,
      };
    } catch (error) {
      this.logger.error(`Unexpected error when getting profile from keybase`, {
        identity,
        error,
      });
    }
  }

  private getCacheKey(identity: string): string {
    return `${ProfileLoaderService.name}.v3.identity:${identity}`;
  }
}
