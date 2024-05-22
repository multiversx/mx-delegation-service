import { elrondConfig } from '../../../config';
import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '../http';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { getHttpAgent, getHttpsAgent } from '../../../utils/http';
import { MultiversXApiNetworkStake } from './models/network-stake.dto';
import { MultiversXApiValidatorAuctionNode, MultiversXApiValidatorAuctionResponse } from './models/validator-auction.dto';

@Injectable()
export class ElrondApiService {
  private readonly httpAgent = getHttpAgent(parseInt(process.env.KEEPALIVE_TIMEOUT_DOWNSTREAM));
  private readonly httspAgent = getHttpsAgent(parseInt(process.env.KEEPALIVE_TIMEOUT_DOWNSTREAM));
  private readonly logger = new Logger(ElrondApiService.name);
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

  async getValidatorUnqualifiedNodes(provider: string): Promise<MultiversXApiValidatorAuctionNode[]> {
    const response = await this.get<MultiversXApiValidatorAuctionResponse>(`validator/auction`);

    const data = response.data;
    if (data == null) {
      return [];
    }

    const auctionList = data.data.auctionList;
    if (auctionList == null || auctionList.length === 0) {
      return [];
    }

    const providerNodes = auctionList.find(auction => auction.owner === provider)?.nodes;
    if (!providerNodes) {
      return [];
    }

    const unqualifiedNodes = providerNodes.filter(node => !node.qualified);

    return unqualifiedNodes;
  }

  private async get<T = never, R = AxiosResponse<T>>(url: string, config?: AxiosRequestConfig): Promise<R | undefined> {
    try {
      return await this.httpService.get(
        url,
        {
          ...this.getConfig(),
          ...config,
        }
      );
    } catch (error) {
      this.logger.error('Error fetching data from Elrond API', {
        url,
        path: 'elrond-api.service.get',
        error,
      });
      return;
    }
  }


}
