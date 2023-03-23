import { Module } from "@nestjs/common";
import { CacheManagerModule } from "../../../cache-manager/cache-manager.module";
import { GithubModule } from "../../../github/github.module";
import { GetProfileLoaderService } from "./get-profile-loader.service";

@Module({
  imports: [
    CacheManagerModule,
    GithubModule,
  ],
  providers: [
    GetProfileLoaderService,
  ],
  exports: [
    GetProfileLoaderService,
  ],
})
export class GetProfileLoaderModule { }
