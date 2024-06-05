import { DynamicModule, Module } from "@nestjs/common";
import { HttpModule } from "../../../http";
import { GithubService } from "./github.service";
import { GithubModuleOptions } from "./github-module.options";

@Module({})
export class GithubModule {
  static register(
    options: GithubModuleOptions,
  ): DynamicModule {
    return {
      module: GithubModule,
      imports: [
        HttpModule,
      ],
      providers: [
        {
          provide: GithubModuleOptions,
          useValue: options,
        },
        GithubService,
      ],
      exports: [
        GithubService,
      ],
    };
  }
}
