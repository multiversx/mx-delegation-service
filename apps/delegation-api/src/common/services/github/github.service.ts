import { Injectable } from "@nestjs/common";
import { AxiosRequestConfig, AxiosResponse } from "axios";
import { getHttpsAgent, getHttpAgent } from "../../../utils/http";
import { HttpService } from "../http";
import { GithubUserInfo } from "./entities/github.user.info";

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

  async getUserInfo(username: string): Promise<GithubUserInfo | undefined> {
    const response = await this.get<GithubUserInfo>(`users/${username}`);

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
