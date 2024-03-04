import { Module } from "@nestjs/common";
import { AssetsService } from "./assets.service";

@Module({
  providers: [
    AssetsService,
  ],
  exports: [
    AssetsService,
  ],
})
export class AssetsModule { }
