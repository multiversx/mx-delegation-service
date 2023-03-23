import { Module } from "@nestjs/common";
import { VerifyIdentityLoaderModule } from "./loader/verify-identity-loader.module";
import { VerifyIdentityService } from "./verify-identity.service";

@Module({
  imports: [
    VerifyIdentityLoaderModule,
  ],
  providers: [
    VerifyIdentityService,
  ],
  exports: [
    VerifyIdentityService,
  ],
})
export class VerifyIdentityModule { }
