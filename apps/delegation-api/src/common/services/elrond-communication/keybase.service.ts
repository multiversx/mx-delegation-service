import { Inject, Injectable } from '@nestjs/common';
import { HttpService } from '../http';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { CacheManagerService } from '../cache-manager/cache-manager.service';
import { getHttpAgent, getHttpsAgent } from '../../../utils/http';
import { AxiosRequestConfig, AxiosResponse } from 'axios';

/**
 * Service used for Elrond API requests;
 */
@Injectable()
export class KeyBaseService extends HttpService {
  /**
   * Set config to keybase url
   */
  config = 'https://keybase.pub';
  profileUrl = 'https://keybase.io';

  private readonly httpAgent = getHttpAgent(parseInt(process.env.KEEPALIVE_TIMEOUT_DOWNSTREAM));
  private readonly httspAgent = getHttpsAgent(parseInt(process.env.KEEPALIVE_TIMEOUT_DOWNSTREAM));

  getConfig = (): AxiosRequestConfig => {
    return {
      baseURL: this.config,
      timeout: parseInt(process.env.KEEPALIVE_TIMEOUT_DOWNSTREAM),
      httpAgent: this.httpAgent,
      httpsAgent: this.httspAgent,
    };
  };

  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private cacheManager: CacheManagerService,
    private readonly httpService: HttpService,
  ) {
    super();
  }

  async get<T = never, R = AxiosResponse<T>>(url: string, config?: AxiosRequestConfig): Promise<R> {
    return this.httpService.get(
      url,
      {
        ...this.getConfig(),
        ...config,
      }
    );
  }

  async head<T = never, R = AxiosResponse<T>>(url: string, config?: AxiosRequestConfig): Promise<R> {
    return this.httpService.head(
      url,
      {
        ...config,
        ...this.getConfig()
      }
    );
  }

  async verifyIdentity(identity: string, address: string): Promise<boolean> {
    let url = `${identity}/elrond/${process.env.KEYBASE_ENV}/${address}`;
    if (process.env.KEYBASE_ENV.trim() === 'mainnet') {
      url = `${identity}/elrond/${address}`;
    }

    const cachedData = await this.cacheManager.getVerifyIdentity(url);
    if (!!cachedData) {
      return cachedData;
    }

    try {
      const response = await this.head(url, {
        transformResponse: () => {
          return {}
        }
      });

      this.logger.info('verifyIdentity', {
        path: 'keybase.service.verifyIdentity',
        identity,
        address,
        statusCode: response.status
      });

      if (response.status == 200) {
        await this.cacheManager.setVerifyIdentity(url, true);
        return true;
      }
    } catch (e) {
      this.logger.error('verifyIdentity', {
        path: 'keybase.service.verifyIdentity',
        identity,
        address,
        exception: e.toString()
      });
      return true;
    }
    await this.cacheManager.setVerifyIdentity(url, false);
    return false;
  }

  async getProfile(identity: string) {
    const cachedData = await this.cacheManager.getProfile(identity);
    if (!!cachedData) {
      return cachedData;
    }
    try {
      const response = await this.get(`_/api/1.0/user/lookup.json?username=${identity}`, {
        baseURL: this.profileUrl
      });

      await this.cacheManager.setProfile(identity, response.data);
      return response.data;
    } catch (e) {
      this.logger.error('verifyIdentity', {
        path: 'keybase.service.verifyIdentity',
        identity,
        exception: e.toString()
      });
      return;
    }
  }
}
