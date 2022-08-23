import { ShardTransaction, TransactionProcessor } from '@elrondnetwork/transaction-processor';
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { elrondConfig } from '../../../config';
import { CacheManagerService } from '../cache-manager/cache-manager.service';
import { ProviderManagerService } from '../provider-manager/provider-manager.service';
import { DelegationDataEnum } from '../../../models/enums';
import { ElrondProxyService } from '../elrond-communication/elrond-proxy.service';
import { ContractConfigResponseDto } from '../../../modules/delegation/dto/contract-config.dto';
import asyncPool from 'tiny-async-pool';
import { CacheWarmerService } from '../cache-warmer/cache-warmer.service';
import { ApiMetricsService } from '../metrics/api.metrics.service';
import { ElrondElasticService } from '../elrond-communication/elrond-elastic.service';
import { PluginService } from '../../plugins/plugin.service';

@Injectable()
export class TransactionProcessorService {
  private readonly logger: Logger;
  private transactionProcessor: TransactionProcessor = new TransactionProcessor();
  constructor(
    private readonly cacheManager: CacheManagerService,
    private readonly providerManager: ProviderManagerService,
    private readonly elrondProxyService: ElrondProxyService,
    private readonly cacheWarmerService: CacheWarmerService,
    private readonly metricsService: ApiMetricsService,
    private readonly pluginService: PluginService,
    private readonly elrondElasticService: ElrondElasticService,
  ) {
    this.logger = new Logger(TransactionProcessorService.name);
  }

  @Cron(CronExpression.EVERY_SECOND)
  async handleNewTransactions(): Promise<void> {
    await this.transactionProcessor.start({
      gatewayUrl: elrondConfig.gateway,
      maxLookBehind: elrondConfig.transactionProcessorMaxLookBehind,
      onTransactionsReceived: async (_, __, transactions) => {
        await this.onTransactionReceived(transactions);
      },
      getLastProcessedNonce: async (shardId) => {
        return await this.cacheManager.getLastProcessedNonce(shardId);
      },
      setLastProcessedNonce: async (shardId, nonce) => {
        await this.cacheManager.setLastProcessedNonce(shardId, nonce);
        this.metricsService.setTransactionProcessorLastNonce(shardId, nonce);
      },
    });
  }

  private onTransactionReceived(transactions: ShardTransaction[]) {
    if (transactions.length === 0) {
      return;
    }
    const validTransactions = transactions.filter(tx => tx.status === 'success');
    asyncPool(4, validTransactions, async transaction => {
      await this.handleTransactionByData(transaction);
    });
  }

  private async handleTransactionByData(transaction: ShardTransaction) {
    if (!transaction.data) {
      return;
    }

    const providerAddresses = await this.providerManager.getAllContractAddresses();
    const userAddress = transaction.sender;
    const scFunctionName = transaction.getDataFunctionName();
    const args = transaction.getDataArgs();

    if (scFunctionName === DelegationDataEnum.mergeValidatorToDelegationSameOwner || scFunctionName === DelegationDataEnum.mergeValidatorToDelegationWithWhitelist) {
      await this.handleMergeValidatorTransactions(userAddress, args, providerAddresses);
      return;
    }

    if (scFunctionName === DelegationDataEnum.makeNewContractFromValidatorData && providerAddresses.includes(userAddress)) {
      await this.cacheManager.setNewContractCreator(userAddress);

      return;
    }

    if (!scFunctionName) {
    //Is a SmartContractResult
      const isContractCreator = await this.cacheManager.getNewContractCreator(transaction.receiver);
      if (isContractCreator && args.length === 2) {
        const verify = args[0];
        if (verify === 'ok') {
          const scAddressHex = args[1];
          const scAddress = scAddressHex.hexToBech32();
          await this.cacheManager.deleteAddressActiveContracts(transaction.receiver);
          await this.cacheManager.deleteIsContractDeployedByAddress(scAddress, transaction.receiver);
          await this.cacheWarmerService.cacheStakingContractDeployedContracts();
          await this.refreshUserActiveStake(transaction.receiver, scAddress);
          await this.refreshAllContractAddresses();
        }
      }
      return;
    }

    if (providerAddresses.includes(transaction.receiver)) {
      if (
        scFunctionName === DelegationDataEnum.changeServiceFee &&
        await this.isTransactionSuccessful(transaction)
      ) {
        await this.pluginService.onProviderFeeChanged(transaction.receiver, args);
        return;
      }

      if (
        scFunctionName === DelegationDataEnum.modifyTotalDelegationCap &&
        await this.isTransactionSuccessful(transaction)
      ) {
        await this.pluginService.onProviderTotalDelegationCapServiceChanged(transaction.receiver, transaction.sender, args);
        return;
      }

      if (scFunctionName === DelegationDataEnum.unStakeNodes) {
        await this.handleUnstakeNodesTransactions(transaction.receiver);
        return;
      }

      await this.handleDelegationTransactions(userAddress, scFunctionName, transaction.receiver, args);
    }
  }

  private async handleMergeValidatorTransactions(senderAddress: string, decodedData: string[], allProviders: string[]) {
    await this.cacheManager.deleteAddressActiveContracts(senderAddress);

    if (decodedData && decodedData.length > 0) {
      const provider = decodedData[0].hexToBech32();
      if (allProviders.indexOf(provider) > -1) {
        await this.cacheManager.deleteGetNumNodes(provider);
        const contractConfig = await this.getContractConfig(provider);
        await this.cacheManager.deleteProviderAPR(provider, Number(contractConfig.serviceFee));
      }
    }
  }

  private async handleUnstakeNodesTransactions(delegationContract: string) {
    const { auctionContract } = elrondConfig;
    const networkStatus = await this.elrondProxyService.getNetworkStatus();
    await this.cacheManager.deleteBlsKeys(auctionContract, delegationContract, networkStatus.EpochNumber);

    const contractConfig = await this.getContractConfig(delegationContract);
    if (contractConfig) {
      await this.cacheManager.deleteProviderAPR(delegationContract, Number(contractConfig.serviceFee));
    }
  }

  private async handleDelegationTransactions(
    senderAddress: string,
    scFunction: string,
    contractAddress: string,
    args: string[]
  ) {
    if (!scFunction || scFunction.length === 0) {
      return;
    }
    const currentEpoch = (await this.elrondProxyService.getNetworkStatus()).EpochNumber;
    await this.cacheManager.deleteAddressActiveContracts(senderAddress);

    switch (scFunction) {
      case DelegationDataEnum.delegate:
        await this.cacheManager.deleteUserActiveStake(senderAddress, contractAddress);
        await this.cacheManager.deleteAddressActiveContracts(senderAddress);
        await this.pluginService.onDelegate(senderAddress, contractAddress);
        break;
      case DelegationDataEnum.withdraw:
        await this.cacheManager.deleteUserUnBondable(senderAddress, contractAddress, currentEpoch);
        await this.cacheManager.deleteUserUndelegatedlist(senderAddress, contractAddress, currentEpoch);
        await this.cacheManager.deleteAddressActiveContracts(senderAddress);
        break;
      case DelegationDataEnum.unDelegate:
        await this.cacheManager.deleteUserUndelegatedlist(senderAddress, contractAddress, currentEpoch);
        await this.cacheManager.deleteUserActiveStake(senderAddress, contractAddress);
        await this.pluginService.onUnDelegate(senderAddress, contractAddress);
        break;
      case DelegationDataEnum.reDelegateRewards:
        await this.cacheManager.deleteClaimableRewards(senderAddress, contractAddress, currentEpoch);
        await this.cacheManager.deleteUserActiveStake(senderAddress, contractAddress);
        break;
      case DelegationDataEnum.claimRewards:
        await this.cacheManager.deleteClaimableRewards(senderAddress, contractAddress, currentEpoch);
        break;
      case DelegationDataEnum.changeOwner:
        if (args.length != 1) {
          return;
        }
        await this.cacheManager.deleteUserActiveStake(senderAddress, contractAddress);
        await this.refreshUserActiveStake(args[0].hexToBech32(), contractAddress);
        break;
    }
  }

  private async refreshUserActiveStake(senderAddress: string, contractAddress: string) {
    await this.cacheManager.deleteUserActiveStake(senderAddress, contractAddress);
    await this.elrondProxyService.getUserActiveStake(contractAddress, senderAddress);
  }

  private async refreshAllContractAddresses() {
    await this.cacheManager.deleteAllContractAddresses();
    await this.providerManager.getAllContractAddresses();
  }

  private async getContractConfig(contractAddress: string): Promise<ContractConfigResponseDto | undefined> {
    const result = await this.elrondProxyService.getContractConfig(contractAddress);
    if (!result) {
      return;
    }
    return ContractConfigResponseDto.fromContractConfig(result.getReturnDataParts());
  }

  private async isTransactionSuccessful(transaction: ShardTransaction): Promise<boolean> {
    const tx = await this.elrondElasticService.getTransactionsByHashes([transaction.hash]);
    return tx[0]?.status === 'success';
  }
}
