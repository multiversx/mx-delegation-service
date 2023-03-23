import { Module } from "@nestjs/common";
import { HttpModule } from "../../../http";
import { KeyBaseService } from "./keybase.service";

@Module({
  imports: [
    HttpModule,
  ],
  providers: [
    KeyBaseService,
  ],
  exports: [
    KeyBaseService,
  ],
})
export class KeybaseModule { }
