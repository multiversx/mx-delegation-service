import { Module } from "@nestjs/common";
import { CacheManagerModule } from "../../../cache-manager/cache-manager.module";
import { KeybaseModule } from "../keybase/keybase.module";
import { ProfileLoaderService } from "./profile-loader.service";
import { AssetsModule } from "../../../assets/assets.module";
import { getGithubConfiguration } from "../../../../../config";

const githubConfig = getGithubConfiguration();

@Module({
  imports: [
    CacheManagerModule,
    KeybaseModule,
    AssetsModule.register(
      {
        organization: githubConfig.organization,
        repository: githubConfig.assetsRepository,
        rawUrl: githubConfig.rawUrl,
      },
      {
        token: githubConfig.token,
        apiUrl: githubConfig.apiUrl,
      }
    ),
  ],
  providers: [
    ProfileLoaderService,
  ],
  exports: [
    ProfileLoaderService,
  ],
})
export class ProfileLoaderModule { }
