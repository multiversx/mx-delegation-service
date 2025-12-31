import { Module } from "@nestjs/common";
import { CacheManagerModule } from "../../cache-manager/cache-manager.module";
import { AssetsModule } from "../../assets/assets.module";
import { IdentitiesLoaderService } from "./identities-loader.service";
import { getGithubConfiguration } from "../../../../config";

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
    IdentitiesLoaderService,
  ],
  exports: [
    IdentitiesLoaderService,
  ],
})
export class IdentitiesLoaderModule { }
