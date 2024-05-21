import { elrondConfig } from '../../../config';
import { Injectable } from '@nestjs/common';
import { HttpService } from '../http';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { getHttpAgent, getHttpsAgent } from '../../../utils/http';
import { MultiversXApiNetworkStake } from './models/network-stake.dto';

@Injectable()
export class ElrondApiService {
  private readonly httpAgent = getHttpAgent(parseInt(process.env.KEEPALIVE_TIMEOUT_DOWNSTREAM));
  private readonly httspAgent = getHttpsAgent(parseInt(process.env.KEEPALIVE_TIMEOUT_DOWNSTREAM));
  constructor(
    private readonly httpService: HttpService
  ) { }

  private getConfig = (): AxiosRequestConfig => {
    return {
      baseURL: elrondConfig.elrondApi,
      timeout: parseInt(process.env.KEEPALIVE_TIMEOUT_DOWNSTREAM),
      httpAgent: this.httpAgent,
      httpsAgent: this.httspAgent,
    };
  };

  async getNetworkStake(): Promise<MultiversXApiNetworkStake | undefined> {
    const response = await this.get<MultiversXApiNetworkStake>(`stake`);

    const data = response.data;
    if (data == null) {
      return;
    }

    return data;
  }

  private get<T = never, R = AxiosResponse<T>>(url: string, config?: AxiosRequestConfig): Promise<R> {
    return this.httpService.get(
      url,
      {
        ...this.getConfig(),
        ...config,
      }
    );
  }
}
