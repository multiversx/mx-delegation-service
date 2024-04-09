import { Injectable } from "@nestjs/common";
import { getHttpAgent, getHttpsAgent } from "../../../../../utils/http";
import { AxiosRequestConfig, AxiosResponse } from "axios";
import { HttpService } from "../../../http";
import { ProfileInfo } from "../common/models/profile.info";
import { BinaryUtils } from "@multiversx/sdk-nestjs-common";

@Injectable()
export class GithubService extends HttpService {
  private readonly httpAgent = getHttpAgent(parseInt(process.env.KEEPALIVE_TIMEOUT_DOWNSTREAM));
  private readonly httspAgent = getHttpsAgent(parseInt(process.env.KEEPALIVE_TIMEOUT_DOWNSTREAM));

  private readonly url: string = 'https://api.github.com';

  constructor(
    private readonly httpService: HttpService
  ) {
    super();
  }

  getConfig = (): AxiosRequestConfig => {
    return {
      baseURL: this.url,
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

  async getRepoContent(username: string, repository: string, path: string): Promise<string | undefined> {
    const response = await this.get<{ content: string }>(`repos/${username}/${repository}/contents/${path}`);

    const content = response.data;
    if (!content) {
      return undefined;
    }

    return BinaryUtils.base64Decode(content.content);
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
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      return {};
    }

    return {
      Authorization: `token ${token}`,
    };
  }
}
