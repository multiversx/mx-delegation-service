import { Inject, Injectable, Logger } from "@nestjs/common";
import { getHttpAgent, getHttpsAgent } from "../../../../../utils/http";
import { AxiosRequestConfig, AxiosResponse } from "axios";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { HttpService } from "../../../http";

@Injectable()
export class KeyBaseService extends HttpService {
  profileUrl = 'https://keybase.io';

  private readonly httpAgent = getHttpAgent(parseInt(process.env.KEEPALIVE_TIMEOUT_DOWNSTREAM));
  private readonly httspAgent = getHttpsAgent(parseInt(process.env.KEEPALIVE_TIMEOUT_DOWNSTREAM));

  getConfig = (): AxiosRequestConfig => {
    return {
      baseURL: this.profileUrl,
      timeout: parseInt(process.env.KEEPALIVE_TIMEOUT_DOWNSTREAM),
      httpAgent: this.httpAgent,
      httpsAgent: this.httspAgent,
    };
  };

  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly httpService: HttpService,
  ) {
    super();
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

  async getProfile(identity: string): Promise<Record<string, any> | undefined> {
    try {
      const response = await this.get(`_/api/1.0/user/lookup.json?username=${identity}`);

      return response.data;
    } catch (e) {
      this.logger.error('getProfile', {
        path: 'keybase.service.getProfile',
        identity,
        exception: e.toString(),
      });
      return;
    }
  }
}
