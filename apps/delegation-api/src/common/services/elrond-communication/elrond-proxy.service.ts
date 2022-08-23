import { ProxyProvider, ContractFunction, Address } from '@elrondnetwork/erdjs';
import { elrondConfig } from '../../../config';
import { Inject, Injectable } from '@nestjs/common';
import { Query } from '@elrondnetwork/erdjs/out/smartcontracts/query';
import { Argument, NetworkConfig } from '@elrondnetwork/erdjs/out';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { NetworkStatus } from '@elrondnetwork/erdjs/out/networkStatus';
import { CacheManagerService } from '../cache-manager/cache-manager.service';
import { QueryResponse } from '@elrondnetwork/erdjs/out/smartcontracts';
import { QueryResponseHelper } from '../../helpers';
import BigNumber from 'bignumber.js';

@Injectable()
export class ElrondProxyService {
  private readonly proxy: ProxyProvider;
  constructor(
    private cacheManager: CacheManagerService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger
  ) {
    this.proxy = new ProxyProvider(elrondConfig.gateway, 60000);
  }

  getService(): ProxyProvider {
    return this.proxy;
  }

  async getAllContractAddresses(): Promise<QueryResponse> {
    const cachedData = await this.cacheManager.getAllContractAddresses();
    if (!!cachedData) {
      return QueryResponse.fromHttpResponse(cachedData)
    }

    const query =
      new Query({
        address: new Address(elrondConfig.stakingContract),
        func: new ContractFunction('getAllContractAddresses'),
      });
    const result = await this.proxy.queryContract(query);
    this.logger.info('getContractList', {
      path: 'elrond-proxy.service.getContractList',
      returnCode : result.returnCode,
      returnMessage: result.returnMessage
    });

    await this.cacheManager.setAllContractAddresses(QueryResponseHelper.getDataForCache(result));
    return result;
  }

  async getContractConfig(delegationContract: string): Promise<QueryResponse> {
    const cachedData = await this.cacheManager.getContractConfig(delegationContract);
    if (!!cachedData) {
      return QueryResponse.fromHttpResponse(cachedData);
    }

    const query =
      new Query({
        address: new Address(delegationContract),
        func: new ContractFunction('getContractConfig'),
      });
    const result = await this.proxy.queryContract(query);
    this.logger.info('getContractConfig', {
      path: 'elrond-proxy.service.getContractConfig',
      delegationContract,
      returnCode : result.returnCode,
      returnMessage: result.returnMessage
    });

    await this.cacheManager.setContractConfig(delegationContract, QueryResponseHelper.getDataForCache(result));
    return result;
  }

  async getBlsKeys (delegationContract: string): Promise<QueryResponse> {
    const { auctionContract } = elrondConfig;
    const networkStatus = await this.getNetworkStatus();
    const cachedData = await this.cacheManager.getBlsKeys(auctionContract, delegationContract, networkStatus.EpochNumber);
    if (!!cachedData) {
      return QueryResponse.fromHttpResponse(cachedData);
    }
    const query =
      new Query({
        address: new Address(auctionContract),
        func: new ContractFunction('getBlsKeysStatus'),
        args: [Argument.fromPubkey(new Address(delegationContract))],
      });
    const result = await this.proxy.queryContract(query);
    this.logger.info('getBlsKeysStatus', {
      path: 'elrond-proxy.service.getBlsKeys',
      delegationContract,
      returnCode : result.returnCode,
      returnMessage: result.returnMessage
    });

    await this.cacheManager.setBlsKeys(auctionContract, delegationContract, networkStatus.EpochNumber, QueryResponseHelper.getDataForCache(result));
    return result;
  }

  async getClaimableRewards(address: string, delegationContract: string): Promise<QueryResponse> {
    const networkStatus = await this.getNetworkStatus();
    const cachedData = await this.cacheManager.getClaimableRewards(address, delegationContract, networkStatus.EpochNumber);
    if (!!cachedData) {
      return QueryResponse.fromHttpResponse(cachedData);
    }

    const result = await this.getUserContractData('getClaimableRewards', address, delegationContract);
    await this.cacheManager.setClaimableRewards(address, delegationContract, networkStatus.EpochNumber, QueryResponseHelper.getDataForCache(result));
    return result;
  }

  async getUserUnBondable(address: string, delegationContract: string): Promise<QueryResponse> {
    const networkStatus = await this.getNetworkStatus();
    const cachedData = await this.cacheManager.getUserUnBondable(address, delegationContract, networkStatus.EpochNumber);
    if (!!cachedData) {
      return QueryResponse.fromHttpResponse(cachedData);
    }

    const result = await this.getUserContractData('getUserUnBondable', address, delegationContract);
    await this.cacheManager.setUserUnBondable(address, delegationContract, networkStatus.EpochNumber, QueryResponseHelper.getDataForCache(result));
    return result;
  }

  async getUserActiveStake(delegationContract: string, address: string): Promise<QueryResponse> {
    const cachedData = await this.cacheManager.getUserActiveStake(address, delegationContract);
    if (!!cachedData) {
      return QueryResponse.fromHttpResponse(cachedData);
    }

    const result = await this.getUserContractData('getUserActiveStake', address, delegationContract);

    await this.cacheManager.setUserActiveStake(address, delegationContract, QueryResponseHelper.getDataForCache(result));
    return result;
  }

  private async getUserContractData(method: string, address: string, delegationContract: string) {
    const query =
      new Query({
        address: new Address(delegationContract),
        func: new ContractFunction(method),
        args: [Argument.fromPubkey(new Address(address))],
      });
    const result = await this.proxy.queryContract(query);
    this.logger.info(method, {
      path: 'elrond-proxy.service.getUserDelegationMethod',
      method,
      delegationContract,
      address,
      returnCode : result.returnCode,
      returnMessage: result.returnMessage
    });
    return result
  }

  async getGlobalDelegationMethod(method: string, delegationContract: string): Promise<QueryResponse> {
    const cachedData = await this.cacheManager.getProviderData(method, delegationContract);
    if (!!cachedData) {
      return QueryResponse.fromHttpResponse(cachedData);
    }

    const query =
      new Query({
        address: new Address(delegationContract),
        func: new ContractFunction(method)
      });
    const result = await this.proxy.queryContract(query);
    this.logger.info(method, {
      path: 'elrond-proxy.service.getGlobalDelegationMethod',
      method,
      delegationContract,
      returnCode : result.returnCode,
      returnMessage: result.returnMessage
    });
    await this.cacheManager.setProviderData(method, delegationContract, QueryResponseHelper.getDataForCache(result));
    return result;
  }

  async getContractMetaData (delegationContract: string): Promise<QueryResponse> {
    const cachedData = await this.cacheManager.getContractMetadata(delegationContract);
    if (!!cachedData) {
      return QueryResponse.fromHttpResponse(cachedData);
    }

    const query =
      new Query({
        address: new Address(delegationContract),
        func: new ContractFunction('getMetaData')
      });
    const result = await this.proxy.queryContract(query);
    this.logger.info('getMetaData', {
      path: 'elrond-proxy.service.getContractMetaData',
      delegationContract,
      returnCode : result.returnCode,
      returnMessage: result.returnMessage
    });
    await this.cacheManager.setContractMetadata(delegationContract, false, QueryResponseHelper.getDataForCache(result));
    return result;
  }

  async getTotalCumulatedRewards(contract: string): Promise<QueryResponse> {
    const networkStatus = await this.getNetworkStatus();
    const cachedData = await this.cacheManager.getTotalCumulatedRewards(contract, networkStatus.EpochNumber);
    if (!!cachedData) {
      return QueryResponse.fromHttpResponse(cachedData);
    }

    const result = await this.getGlobalDelegationMethod('getTotalCumulatedRewards', contract);
    await this.cacheManager.setTotalCumulatedRewards(contract, networkStatus.EpochNumber, QueryResponseHelper.getDataForCache(result));
    return result
  }

  async getUserUnDelegatedList(address: string, delegationContract: string): Promise<QueryResponse> {
    const networkStatus = await this.getNetworkStatus()
    const cachedData = await this.cacheManager.getUserUndelegatedList(address, delegationContract, networkStatus.EpochNumber);
    if (!!cachedData) {
      return QueryResponse.fromHttpResponse(cachedData);
    }
    const query =
      new Query({
        address: new Address(delegationContract),
        func: new ContractFunction('getUserUnDelegatedList'),
        args: [Argument.fromPubkey(new Address(address))],
      });
    const result = await this.proxy.queryContract(query);
    this.logger.info('getUserUnDelegatedList', {
      path: 'elrond-proxy.service.getUserUnDelegatedList',
      delegationContract,
      address,
      returnCode : result.returnCode,
      returnMessage: result.returnMessage
    });
    await this.cacheManager.setUserUndelegatedlist(address, delegationContract, networkStatus.EpochNumber, QueryResponseHelper.getDataForCache(result));
    return result;
  }

  async getQueueRegisterNonceAndRewardAddress(): Promise<QueryResponse> {
    const { auctionContract, blsRewardsAddress } = elrondConfig;
    const cachedData = await this.cacheManager.getQueueRegisterNonceAndRewardAddress();
    if (!!cachedData) {
      return QueryResponse.fromHttpResponse(cachedData);
    }

    const query =
      new Query({
        address: new Address(blsRewardsAddress),
        func: new ContractFunction('getQueueRegisterNonceAndRewardAddress'),
        caller: new Address(auctionContract)
      });
    const result = await this.proxy.queryContract(query);
    await this.cacheManager.setQueueRegisterNonceAndRewardAddress(QueryResponseHelper.getDataForCache(result));
    return result;
  }

  async getNetworkConfig(): Promise<NetworkConfig> {
    let networkConfig = await this.cacheManager.getNetworkConfig();
    if (!!networkConfig) {
      return networkConfig;
    }
    networkConfig = await this.proxy.getNetworkConfig();
    await this.cacheManager.setNetworkConfig(networkConfig);

    return networkConfig
  }

  async getNetworkStatus(): Promise<NetworkStatus> {
    let networkStatus = await this.cacheManager.getNetworkStatus();
    if (!!networkStatus) {
      return networkStatus;
    }

    networkStatus = await this.proxy.getNetworkStatus();
    await this.cacheManager.setNetworkStatus(networkStatus);
    return networkStatus;
  }

  async getAccountBalance(address: string): Promise<BigNumber> {
    const accountBalance = await this.cacheManager.getAccountBalance(address);
    if (!!accountBalance) {
      return accountBalance;
    }
    const account = await this.getService().getAccount(new Address(address));
    await this.cacheManager.setAccountBalance(address, account.balance.valueOf());
    return account.balance.valueOf();
  }
}
