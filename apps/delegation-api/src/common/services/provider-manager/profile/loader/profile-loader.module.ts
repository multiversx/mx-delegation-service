import { Module } from "@nestjs/common";
import { CacheManagerModule } from "../../../cache-manager/cache-manager.module";
import { GithubModule } from "../github/github.module";
import { KeybaseModule } from "../keybase/keybase.module";
import { ProfileLoaderService } from "./profile-loader.service";

@Module({
  imports: [
    CacheManagerModule,
    GithubModule,
    KeybaseModule,
  ],
  providers: [
    ProfileLoaderService,
  ],
  exports: [
    ProfileLoaderService,
  ],
})
export class ProfileLoaderModule { }
