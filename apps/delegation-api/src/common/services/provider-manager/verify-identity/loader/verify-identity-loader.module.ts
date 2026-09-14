import { Module } from "@nestjs/common";
import { CacheManagerModule } from "../../../cache-manager/cache-manager.module";
import { VerifyIdentityLoaderService } from "./verify-identity-loader.service";
import { AssetsModule } from "../../../assets/assets.module";
import { getGithubConfiguration } from "../../../../../config";

const githubConfig = getGithubConfiguration();

@Module({
  imports: [
    CacheManagerModule,
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
    VerifyIdentityLoaderService,
  ],
  exports: [
    VerifyIdentityLoaderService,
  ],
})
export class VerifyIdentityLoaderModule { }
