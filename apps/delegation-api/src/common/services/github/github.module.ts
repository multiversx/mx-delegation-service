import { Module } from "@nestjs/common";
import { HttpModule } from "../http";
import { GithubService } from "./github.service";

@Module({
  imports: [
    HttpModule,
  ],
  providers: [
    GithubService,
  ],
  exports: [
    GithubService,
  ],
})
export class GithubModule { }
