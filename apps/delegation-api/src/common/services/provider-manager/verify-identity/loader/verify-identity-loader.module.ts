import { Module } from "@nestjs/common";
import { CacheManagerModule } from "../../../cache-manager/cache-manager.module";
import { GithubModule } from "../../../github/github.module";
import { VerifyIdentityLoaderService } from "./verify-identity-loader.service";

@Module({
  imports: [
    CacheManagerModule,
    GithubModule,
  ],
  providers: [
    VerifyIdentityLoaderService,
  ],
  exports: [
    VerifyIdentityLoaderService,
  ],
})
export class VerifyIdentityLoaderModule { }
