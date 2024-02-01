import { Module } from "@nestjs/common";
import { CacheManagerModule } from "../../../cache-manager/cache-manager.module";
import { KeybaseModule } from "../keybase/keybase.module";
import { ProfileLoaderService } from "./profile-loader.service";
import { AssetsModule } from "../../../assets/assets.module";

@Module({
  imports: [
    CacheManagerModule,
    KeybaseModule,
    AssetsModule,
  ],
  providers: [
    ProfileLoaderService,
  ],
  exports: [
    ProfileLoaderService,
  ],
})
export class ProfileLoaderModule { }
