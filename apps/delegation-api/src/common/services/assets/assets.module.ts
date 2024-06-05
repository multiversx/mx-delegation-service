import { DynamicModule, Module } from "@nestjs/common";
import { AssetsService } from "./assets.service";
import { GithubModule } from "../provider-manager/profile/github/github.module";
import { HttpModule } from "../http";
import { AssetsModuleOptions } from "./assets-module.options";
import { GithubModuleOptions } from "../provider-manager/profile/github/github-module.options";

@Module({})
export class AssetsModule {
  static register(
    assetsOptions: AssetsModuleOptions,
    githubOptions: GithubModuleOptions,
  ): DynamicModule {
    return {
      module: AssetsModule,
      imports: [
        GithubModule.register(githubOptions),
        HttpModule,
      ],
      providers: [
        {
          provide: AssetsModuleOptions,
          useValue: assetsOptions,
        },
        AssetsService,
      ],
      exports: [
        AssetsService,
      ],
    };
  }
}
