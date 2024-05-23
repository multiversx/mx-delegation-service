import { Module } from "@nestjs/common";
import { ElrondCommunicationModule } from "../../elrond-communication.module";
import { CacheManagerModule } from "../../../cache-manager/cache-manager.module";
import { NetworkStakeLoaderService } from "./network-stake-loader.service";

@Module({
  imports: [
    CacheManagerModule,
    ElrondCommunicationModule,
  ],
  providers: [
    NetworkStakeLoaderService,
  ],
  exports: [
    NetworkStakeLoaderService,
  ],
})
export class NetworkStakeLoaderModule { }
