import { Injectable } from "@nestjs/common";
import path from "path";
import { IdentityInfo } from "./models/identity.info";
import { GithubService } from "../provider-manager/profile/github/github.service";
import { HttpService } from "../http";
import { AssetsModuleOptions } from "./assets-module.options";

@Injectable()
export class AssetsService {
  constructor(
    private readonly githubService: GithubService,
    private readonly httpService: HttpService,
    private readonly options: AssetsModuleOptions,
  ) { }

  async getDistinctIdentities(): Promise<string[]> {
    const dirContents = await this.githubService.getRepoFolderContent(this.options.organization, this.options.repository, this.getRelativePath('identities'));
    if (dirContents == null) {
      return [];
    }

    return dirContents.map(dirent => dirent.name);
  }

  async getIdentityInfo(identity: string): Promise<IdentityInfo | null> {
    const url = this.getIdentityInfoJsonContentUrl(identity);
    const response = await this.httpService.get<IdentityInfo>(url);
    if (response.data == null) {
      return null;
    }

    return response.data;
  }

  private getIdentityInfoJsonContentUrl(identity: string): string {
    const path = this.getRelativePath('identities') + '/' + identity;
    return `${this.options.rawUrl}/${path}/info.json`;
  }

  private getRelativePath(name: string): string {
    const network = process.env.NODE_ENV;
    if (network !== 'production' && network !== 'mainnet') {
      return path.join(network, name);
    }

    return name;
  }
}
