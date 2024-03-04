import { Module } from "@nestjs/common";
import { CacheManagerModule } from "../../cache-manager/cache-manager.module";
import { AssetsModule } from "../../assets/assets.module";
import { IdentitiesLoaderService } from "./identities-loader.service";

@Module({
  imports: [
    CacheManagerModule,
    AssetsModule,
  ],
  providers: [
    IdentitiesLoaderService,
  ],
  exports: [
    IdentitiesLoaderService,
  ],
})
export class IdentitiesLoaderModule { }
