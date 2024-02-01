import { Module } from "@nestjs/common";
import { CacheManagerModule } from "../../../cache-manager/cache-manager.module";
import { VerifyIdentityLoaderService } from "./verify-identity-loader.service";
import { AssetsModule } from "../../../assets/assets.module";

@Module({
  imports: [
    CacheManagerModule,
    AssetsModule,
  ],
  providers: [
    VerifyIdentityLoaderService,
  ],
  exports: [
    VerifyIdentityLoaderService,
  ],
})
export class VerifyIdentityLoaderModule { }
