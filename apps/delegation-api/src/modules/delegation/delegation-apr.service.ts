import { Injectable } from '@nestjs/common';
import denominate from './formatters';
import { ElrondProxyService } from '../../common/services/elrond-communication/elrond-proxy.service';
import { ElrondApiService } from '../../common/services/elrond-communication/elrond-api.service';
import { elrondConfig } from '../../config';
import { CacheManagerService } from '../../common/services/cache-manager/cache-manager.service';

const denominateValue = (value: string) => {
  const denominatedValueString = denominate({
    input: value,
    denomination: elrondConfig.denomination,
    decimals: elrondConfig.decimals,
    showLastNonZeroDecimal: true,
  });
  return denominatedValueString.replace(/,/g, '');
};

@Injectable()
export class DelegationAprService {

  constructor(
    private elrondApiService: ElrondApiService,
    private elrondProxyService: ElrondProxyService,
    private cacheManager: CacheManagerService
  ) {
  }

  async getProviderAPR(
    delegationContract: string,
    serviceFee: number
  ): Promise<number> {

    const cachedAPR = await this.cacheManager.getProviderAPR(delegationContract, serviceFee);
    if (!!cachedAPR) {
      return cachedAPR;
    }

    const [
      activeStakeResponse,
      blsKeysResponse,
      networkStats,
      networkStake,
      networkConfig,
      stakedBalance,
      ] = await Promise.all(
      [
        this.elrondProxyService.getGlobalDelegationMethod('getTotalActiveStake', delegationContract),
        this.elrondProxyService.getBlsKeys(delegationContract),
        this.elrondProxyService.getNetworkStatus(),
        this.elrondApiService.getNetworkStake(),
        this.elrondProxyService.getNetworkConfig(),
        this.elrondProxyService.getAccountBalance(elrondConfig.auctionContract),
      ]
    );

    const blsKeys: Buffer[] = blsKeysResponse.getReturnDataParts();
    const activeStake: Buffer = activeStakeResponse.getReturnDataParts()[0];
    const feesInEpoch = elrondConfig.feesInEpoch;
    const stakePerNode = elrondConfig.stakePerNode;
    const protocolSustainabilityRewards = elrondConfig.protocolSustainabilityRewards;
    if (!networkConfig.RoundsPerEpoch) {
      networkConfig.RoundsPerEpoch = networkStats.RoundsPerEpoch;
    }
    const epochDuration = networkConfig.RoundDuration / 1000 * networkConfig.RoundsPerEpoch;
    const secondsInYear = 365 * 24 * 3600;
    const epochsInYear = secondsInYear / epochDuration;

    const inflationRate =
      elrondConfig.yearSettings.find(x => x.year === Math.floor(networkStats.EpochNumber / epochsInYear) + 1)?.maximumInflation || 0;
    const rewardsPerEpoch = Math.max((inflationRate * elrondConfig.genesisTokenSupply) / epochsInYear, feesInEpoch);
    const rewardsPerEpochWithoutProtocolSustainability =
      (1 - protocolSustainabilityRewards) * rewardsPerEpoch;
    const topUpRewardsLimit =
      0.5 * rewardsPerEpochWithoutProtocolSustainability;
    const networkBaseStake = networkStake.ActiveValidators * stakePerNode;
    const networkTotalStake = parseInt(denominateValue(stakedBalance.toFixed()));

    const networkTopUpStake =
      networkTotalStake -
      networkStake.TotalValidators * stakePerNode -
      networkStake.QueueSize * stakePerNode;

    const topUpReward =
      ((2 * topUpRewardsLimit) / Math.PI) *
      Math.atan(
        networkTopUpStake /
        (2 * 2000000)
      );
    const baseReward = rewardsPerEpochWithoutProtocolSustainability - topUpReward;
    const allNodes = blsKeys.filter(key => key.asString() === 'staked' || key.asString() === 'jailed' || key.asString() === 'queued')
      .length;

    const allActiveNodes = blsKeys.filter(key => key.asString() === 'staked').length;
    if (allActiveNodes <= 0) {
      return 0;
    }

    // based on validator total stake recalibrate the active nodes.
    // it can happen that an user can unStake some tokens, but the node is still active until the epoch change
    const validatorTotalStake = parseInt(denominateValue(activeStake.asBigInt().toFixed()));
    const actualNumberOfNodes = Math.min(Math.floor(validatorTotalStake / stakePerNode), allActiveNodes);
    const validatorBaseStake = actualNumberOfNodes * stakePerNode;
    const validatorTopUpStake = ((validatorTotalStake - allNodes * stakePerNode) / allNodes) * allActiveNodes;
    const validatorTopUpReward =
      networkTopUpStake > 0 ? (validatorTopUpStake / networkTopUpStake) * topUpReward : 0;
    const validatorBaseReward = (validatorBaseStake / networkBaseStake) * baseReward;
    const anualPercentageRate =
      (epochsInYear * (validatorTopUpReward + validatorBaseReward)) / validatorTotalStake;

    const apr = (anualPercentageRate * (1 - serviceFee / 100 / 100) * 100);
    await this.cacheManager.setProviderAPR(delegationContract, serviceFee, apr);
    return apr;
  }
}
