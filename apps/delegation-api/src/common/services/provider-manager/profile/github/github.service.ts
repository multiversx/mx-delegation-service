import { Injectable, Logger } from "@nestjs/common";
import { getHttpAgent, getHttpsAgent } from "../../../../../utils/http";
import { AxiosRequestConfig, AxiosResponse } from "axios";
import { HttpService } from "../../../http";
import { ProfileInfo } from "../common/models/profile.info";
import { GithubFolderContent } from "./models/github-folder-content";
import { GithubModuleOptions } from "./github-module.options";

@Injectable()
export class GithubService {
  private readonly logger: Logger = new Logger(GithubService.name);
  private readonly httpAgent = getHttpAgent(parseInt(process.env.KEEPALIVE_TIMEOUT_DOWNSTREAM));
  private readonly httspAgent = getHttpsAgent(parseInt(process.env.KEEPALIVE_TIMEOUT_DOWNSTREAM));

  constructor(
    private readonly httpService: HttpService,
    private readonly options: GithubModuleOptions,
  ) { }

  getConfig = (): AxiosRequestConfig => {
    return {
      baseURL: this.options.apiUrl,
      timeout: parseInt(process.env.KEEPALIVE_TIMEOUT_DOWNSTREAM),
      httpAgent: this.httpAgent,
      httpsAgent: this.httspAgent,
      headers: this.getHeaders(),
    };
  };

  async getUserInfo(username: string): Promise<ProfileInfo | undefined> {
    const response = await this.get<ProfileInfo>(`users/${username}`);

    const profile = response.data;
    if (!profile) {
      return undefined;
    }

    return {
      username,
      name: profile.name,
      avatar_url: profile.avatar_url,
      bio: profile.bio,
      location: profile.location,
      twitter_username: profile.twitter_username,
      blog: profile.blog,
    };
  }

  async getRepoFolderContent(username: string, repository: string, folder: string): Promise<GithubFolderContent[] | undefined> {
    try {
      const response = await this.get<GithubFolderContent[]>(`repos/${username}/${repository}/contents/${folder}`);

      const content = response.data;
      if (content == null) {
        return [];
      }

      return content;
    } catch (error) {
      this.logger.error(`[${GithubService.name}] Unexpected error while getting repo folder content`, {
        username,
        repository,
        folder,
        error,
      });

      return;
    }
  }

  get<T = never, R = AxiosResponse<T>>(url: string, config?: AxiosRequestConfig): Promise<R> {
    return this.httpService.get(
      url,
      {
        ...this.getConfig(),
        ...config,
      }
    );
  }

  protected getHeaders(): Record<string, string> {
    const token = this.options.token;

    return {
      Authorization: `token ${token}`,
    };
  }
}
