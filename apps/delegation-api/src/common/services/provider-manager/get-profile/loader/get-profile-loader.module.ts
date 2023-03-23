import { Module } from "@nestjs/common";
import { CacheManagerModule } from "../../../cache-manager/cache-manager.module";
import { GithubModule } from "../../../github/github.module";
import { KeybaseModule } from "../keybase/keybase.module";
import { GetProfileLoaderService } from "./get-profile-loader.service";

@Module({
  imports: [
    CacheManagerModule,
    GithubModule,
    KeybaseModule,
  ],
  providers: [
    GetProfileLoaderService,
  ],
  exports: [
    GetProfileLoaderService,
  ],
})
export class GetProfileLoaderModule { }
