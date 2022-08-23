import { Inject, Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CacheManagerService } from '../../common/services/cache-manager/cache-manager.service';
import { ProviderManagerService } from '../../common/services/provider-manager/provider-manager.service';
import { Provider } from './dto/providers.response.dto';
import { BadRequest } from '../../common/errors';
import { ErrorCodes } from '../../utils';
import { ContractConfigResponseDto } from '../delegation/dto/contract-config.dto';
import { ElrondProxyService } from '../../common/services/elrond-communication/elrond-proxy.service';
import { DelegationAprService } from '../delegation/delegation-apr.service';
import BigNumber from 'bignumber.js';
import { ProviderWithData } from './dto/provider-with-data.dto';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { GlobalContractDataResponseDto } from '../delegation/dto/global-contract-data-response.dto';
import { QueryResponseHelper } from '../../common/helpers';
import { RedlockService } from '../../common/services';
import asyncPool from 'tiny-async-pool';
import { elrondConfig } from '../../config';
import { ElrondElasticService } from '../../common/services/elrond-communication/elrond-elastic.service';
import { ProviderDelegation } from './dto/provider-delegation.dto';

@Injectable()
export class ProvidersService {

  constructor(
    private cacheManagerService: CacheManagerService,
    private providerManager: ProviderManagerService,
    private elrondProxyService: ElrondProxyService,
    private delegationAprService: DelegationAprService,
    private redlockService: RedlockService,
    private elrondElasticService: ElrondElasticService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger
  ) {
  }

  // Warm cache for providers / 1 minute
  @Cron(CronExpression.EVERY_MINUTE)
  async cacheProviders(): Promise<void> {
    const resource = 'all.providers.cache.lock';
    const lockExpire = 40;
    let lock;
    try {
      lock = await this.redlockService.lockTryOnce(resource, lockExpire);
    } catch (e) {
      return;
    }
    if (lock === 0) {
      return;
    }

    this.logger.info('Keeping the cache warm for providers', {
      path: 'providers.service.cacheProviders',
    });
    const providers = await this.getProviders();
    await this.cacheManagerService.setAllProviders(providers);
    this.logger.info(`Cached ${providers?.length} providers`, {
      path: 'providers.service.cacheProviders',
    });
  }

  async getAllProviders(featured: boolean): Promise<Provider[]> {
    const cachedProviders = await this.cacheManagerService.getAllProviders();
    const allContracts = await this.providerManager.getAllContractAddresses();
    if (!!cachedProviders && cachedProviders.length === allContracts.length) {
      if (featured) {
        return cachedProviders.filter(p => p.featured === true);
      }
      return cachedProviders;
    }
    return this.getProviders(featured);
  }

  private async getProviders(featured = false) : Promise<Provider[]> {
    const allContracts = await this.providerManager.getAllContractAddresses();
    const allProviders = await this.providerManager.getAllProvidersWithData(allContracts);
    if (!featured) {
      return await this.getProvidersForApi(allProviders);
    }

    const featuredProviders = process.env.FEATURED_PROVIDERS.split(',')
      .map((entry) => {
        return entry.toLowerCase().trim();
      });

    return await this.getProvidersForApi(allProviders.filter(
        (x) => featuredProviders.includes(x.identity.name?.toLowerCase())
      ));
  }

  async getProvider(provider: string): Promise<Provider> {
    const cachedProviders = await this.cacheManagerService.getAllProviders();
    if (!!cachedProviders) {
      const foundProvider = cachedProviders.find(p => p.contract === provider);
      if (!!foundProvider) {
        return foundProvider;
      }
    }
    const foundProvider = await this.providerManager.getProviderInfo(provider);
    return (await this.getProvidersForApi([new ProviderWithData(foundProvider)]))[0];
  }

  async getProviderDelegations(provider: string, page: number): Promise<ProviderDelegation[]> {
    const delegations =  await this.elrondElasticService.getDelegationsForContract(provider, page);
    if (!delegations) {
      return [];
    }
    return delegations.map(e => ProviderDelegation.fromAddressActiveContract(e));
  }

  private async getProvidersForApi(providers: ProviderWithData[]): Promise<Provider[]> {
    return await asyncPool(4, providers, async provider => {
      try {
        let stakingProvider = new Provider(
          provider.identity,
        );

        stakingProvider.setFromContractConfig(await this.getContractConfig(provider.identity.contract));
        stakingProvider.setFromContractData(await this.getGlobalContractData(provider.identity.contract));
        stakingProvider.setFromFeeChanges(await this.cacheManagerService.getContractFeeChange(provider.identity.contract));
        stakingProvider = this.updateDelegationInfo(stakingProvider);
        stakingProvider.ownerBelowRequiredBalanceThreshold =
          await this.isContractOwnerBellowStakedRequiredThreshold(stakingProvider.contract, stakingProvider.owner);

        return stakingProvider;
      } catch (e) {
        this.logger.error('Error getting provider data', {
          path: 'providers.service.getProvidersForApi',
          delegationContract: provider.identity.contract,
          exception: e.toString(),
        });
      }
    });
  }

  private async isContractOwnerBellowStakedRequiredThreshold(contractAddress: string, ownerAddress: string) {
    try {
      const stakedBalance = QueryResponseHelper.handleQueryAmountResponse(
        await this.elrondProxyService.getUserActiveStake(
          contractAddress,
          ownerAddress,
        ));
      return new BigNumber(stakedBalance).isLessThan(
        new BigNumber(elrondConfig.minimumAmountOwner, 10)
          .multipliedBy(new BigNumber(1000000000000000000))
      );
    } catch (e) {
      this.logger.error('Error comparing owner staked amount', {
        path: 'providers.service.isContractOwnerBellowStakedRequiredThreshold',
        delegationContract: contractAddress,
        exception: e.toString(),
      });
      return false;
    }
  }

  private async getGlobalContractData(contract: string)
    : Promise<GlobalContractDataResponseDto> {

    const [
      totalActiveStake,
      totalUnStaked,
      totalCumulatedRewards,
      numUsers,
      numNodes,
    ] =
      await Promise.all([
        this.getTotalContractAmount('getTotalActiveStake', contract),
        this.getTotalContractAmount('getTotalUnStaked', contract),
        this.getTotalCumulatedRewards(contract),
        this.getTotalContractAmount('getNumUsers', contract),
        this.getTotalContractAmount('getNumNodes', contract),
      ]);

    return new GlobalContractDataResponseDto(
      contract,
      totalActiveStake,
      totalUnStaked,
      totalCumulatedRewards,
      Number(numUsers),
      Number(numNodes)
    );
  }

  private async getTotalContractAmount(method: string, contract: string) {
    try {
      return QueryResponseHelper.handleQueryAmountResponse(
        await this.elrondProxyService.getGlobalDelegationMethod(method, contract)
      );
    } catch (e) {
      this.logger.error(`Error getting ${method}`, {
        path: 'providers.service.getTotalContractAmount',
        delegationContract: contract,
        method,
        exception: e.toString(),
      });
      return null;
    }
  }

  private async getTotalCumulatedRewards(contract: string): Promise<string> {
    try {
      return QueryResponseHelper.handleQueryAmountResponse(
        await this.elrondProxyService.getTotalCumulatedRewards(contract)
      );
    } catch (e) {
      this.logger.error('Error getting total cumulated rewards', {
        path: 'providers.service.getTotalCumulatedRewards',
        delegationContract: contract,
        exception: e.toString(),
      });
      return null;
    }
  }

  private updateDelegationInfo(stakingProvider: Provider): Provider {
    const maxAllowed = new BigNumber(stakingProvider.maxDelegationCap, 10).minus(
      new BigNumber(stakingProvider.totalActiveStake, 10)
    );
    if (maxAllowed.isNegative()) {
      stakingProvider.maxDelegateAmountAllowed = '0';
    } else {
      stakingProvider.maxDelegateAmountAllowed = maxAllowed.toString(10);
    }

    if (
      stakingProvider.checkCapOnRedelegate
    ) {
      stakingProvider.maxRedelegateAmountAllowed =
        stakingProvider.maxDelegateAmountAllowed;
    }

    return stakingProvider;
  }

  private async getContractConfig(contract: string): Promise<ContractConfigResponseDto> {
    try {
      const result = await this.elrondProxyService.getContractConfig(contract);

      if (!result) {
        return null;
      }

      const response = ContractConfigResponseDto.fromContractConfig(result.getReturnDataParts());

      console.log(response);
      response.aprValue = await this.delegationAprService.getProviderAPR(contract, Number(response.serviceFee));
      response.apr = response.aprValue.toFixed(2);

      return response;
    } catch (e) {
      this.logger.error('Error getting Contract config', {
        path: 'providers.service.getContractConfig',
        delegationContract: contract,
        exception: e.toString(),
      });

      throw BadRequest.fromError({
        message: 'Error calling getContractConfig',
        error: ErrorCodes.errorCallingContract,
      });
    }
  }
}
