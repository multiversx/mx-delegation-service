import { Inject, Injectable } from '@nestjs/common';
import { ElrondElasticService } from '../../common/services/elrond-communication/elrond-elastic.service';
import { CacheManagerService } from '../../common/services/cache-manager/cache-manager.service';
import '../../utils/extentions';
import { UserUndelegatedItem, UserUndelegatedListDto } from './dto/user-undelegated-list.dto';
import { ElrondProxyService } from '../../common/services/elrond-communication/elrond-proxy.service';
import { Delegation } from './dto/delegation.dto';
import { QueryResponseHelper } from '../../common/helpers';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { NetworkStatus } from '@multiversx/sdk-network-providers';

@Injectable()
export class DelegationService {
  constructor(
    private elrondElasticService: ElrondElasticService,
    private cacheManagerService: CacheManagerService,
    private elrondProxyService: ElrondProxyService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger
  ) {
  }

  private async invalidateUserInfoForContract(address: string, contract: string) {
    const networkStatus: NetworkStatus = await this.elrondProxyService.getNetworkStatus();
    const currentEpoch: number = networkStatus.EpochNumber;
    await this.cacheManagerService.deleteUserUndelegatedlist(address, contract, currentEpoch);
    await this.cacheManagerService.deleteUserActiveStake(address, contract);
    await this.cacheManagerService.deleteClaimableRewards(address, contract, currentEpoch);
    await this.cacheManagerService.deleteUserUnBondable(address, contract, currentEpoch);
  }

  async getAllContractDataForUser(address: string, forceRefresh?: boolean): Promise<Delegation[]> {
    if (forceRefresh) {
      await this.cacheManagerService.deleteAddressActiveContracts(address);
    }

    let allActiveContracts = await this.cacheManagerService.getAddressActiveContracts(address);
    if (!allActiveContracts) {
      allActiveContracts = await this.elrondElasticService.getAddressActiveContracts(address);
    }

    await this.cacheManagerService.setAddressActiveContracts(address, allActiveContracts);

    const response = [];
    for (const activeContract of allActiveContracts) {
      if (forceRefresh) {
        await this.invalidateUserInfoForContract(address, activeContract.contract);
      }

      const contractDataForUser = await this.getContractDataForUser(
        activeContract.contract,
        address
      );
      if (!!contractDataForUser) {
        response.push(
          contractDataForUser
        );
      }
    }
    return response;
  }

  async getUserActiveStake(contract: string, address: string): Promise<string> {
    try {
      return QueryResponseHelper.handleQueryAmountResponse(
        await this.elrondProxyService.getUserActiveStake(
          contract,
          address
        ));
    } catch (e) {
      this.logger.error('Error getting User active stake', {
        path: 'delegation.service.getUserActiveStake',
        contract,
        userAddress: address,
        exception: e.toString(),
      });
      return null;
    }
  }

  private async getUserUnBondable(address: string, contract: string) {
    try {
      return QueryResponseHelper.handleQueryAmountResponse(
        await this.elrondProxyService.getUserUnBondable(address, contract)
      );
    } catch (e) {
      this.logger.error('Error getting User Unbondable', {
        path: 'delegation.service.getUserUnBondable',
        contract,
        userAddress: address,
        exception: e.toString(),
      });
      return null;
    }
  }

  private async getClaimableRewards(address: string, contract: string) {
    try {
      return QueryResponseHelper.handleQueryAmountResponse(
        await this.elrondProxyService.getClaimableRewards(address, contract)
      );
    } catch (e) {
      this.logger.error('Error getting User Claimable Rewards', {
        path: 'delegation.service.getClaimableRewards',
        contract,
        userAddress: address,
        exception: e.toString(),
      });
      return null;
    }
  }

  private async getUserUnDelegatedList(contract: string, address: string): Promise<UserUndelegatedListDto> {
    try {
      const scResponse = await this.elrondProxyService.getUserUnDelegatedList(
        address,
        contract
      );

      if (!scResponse.returnData || scResponse.returnData.length === 0) {
        return new UserUndelegatedListDto(
          address,
          contract,
          []
        );
      }

      const networkConfig = await this.elrondProxyService.getNetworkConfig();
      const networkStatus = await this.elrondProxyService.getNetworkStatus();
      if (!networkConfig.RoundsPerEpoch) {
        networkConfig.RoundsPerEpoch = networkStatus.RoundsPerEpoch;
      }

      const undelegatedList = scResponse.getReturnDataParts();
      const results = [];
      for (let index = 0; index < undelegatedList.length - 1; index = index + 2) {
        const undelegatedAmountBuffer = undelegatedList[index];
        const remainingEpochsBuffer = undelegatedList[index + 1];
        const remainingEpochsNumber = remainingEpochsBuffer.asNumber();
        const amount = undelegatedAmountBuffer.asFixed();
        const cachedExpireTime = await this.cacheManagerService.getUndelegatedExpireTime(
          address,
          contract,
          amount,
          remainingEpochsNumber,
          networkStatus.EpochNumber);

        if (!!cachedExpireTime) {
          // if there is a cached expire time calculate seconds and add them to the returned object
          const expireDateTime = Date.parse(cachedExpireTime);
          const currentDate = new Date();
          let cachedSecondsLeft = Math.round((expireDateTime - currentDate.getTime()) / 1000);
          if (cachedSecondsLeft < 0) {
            cachedSecondsLeft = 0;
          }
          results.push(
            new UserUndelegatedItem(
              amount,
              cachedSecondsLeft
            )
          );
          continue;
        }

        const secondsLeft = this.calculateUndelegatedSecondsLeft(
          networkConfig.RoundsPerEpoch,
          networkConfig.RoundDuration,
          networkStatus.RoundsPassedInCurrentEpoch,
          remainingEpochsNumber
        );

        const expireDate = new Date();
        expireDate.setSeconds(expireDate.getSeconds() + secondsLeft);
        // cache expireDate, so we can calculate secondsLeft on future requests, when no new data will be fetched from
        // vm-query.
        await this.cacheManagerService.setUndelegatedExpireTime(
          address,
          contract,
          amount,
          remainingEpochsNumber,
          networkStatus.EpochNumber,
          expireDate.toString());

        results.push(
          new UserUndelegatedItem(
            amount,
            secondsLeft
          )
        );

      }

      return new UserUndelegatedListDto(
        address,
        contract,
        results
      );
    } catch (e) {
      this.logger.error('Error getting User Undelegated list', {
        path: 'delegation.service.getUserUnDelegatedList',
        contract,
        userAddress: address,
        exception: e.toString(),
      });
      return null;
    }
  }

  private calculateUndelegatedSecondsLeft(
    roundsPerEpoch: number,
    roundDuration: number,
    roundsPassedInCurrentEpoch: number,
    remainingEpochs: number): number {
    let roundsCurrentEpoch = roundsPerEpoch - roundsPassedInCurrentEpoch;
    if (roundsCurrentEpoch < 0) roundsCurrentEpoch = 0;
    let roundsCompletedEpochs = 0;
    let secondsLeft: number;
    if (remainingEpochs >= 1) {
      roundsCompletedEpochs = (remainingEpochs - 1) * roundsPerEpoch;
      const totalRounds = roundsCurrentEpoch + roundsCompletedEpochs;
      secondsLeft = totalRounds * roundDuration / 1000;
    } else {
      secondsLeft = 0;
    }

    return secondsLeft;
  }
  async getDelegationForUser(contract: string, address: string): Promise<Delegation | null> {
    const delegation = await this.elrondElasticService.getDelegationForAddressAndContract(address, contract);
    return delegation ? this.getContractDataForUser(contract, address) : null;
  }

  /**
   *
   * @param contract
   * @param address
   */
  private async getContractDataForUser(contract: string, address: string): Promise<Delegation> {
    const [
      userUnBondable,
      userActiveStake,
      claimableRewards,
      userUndelegatedList,
    ] =
      await Promise.all([
        this.getUserUnBondable(address, contract),
        this.getUserActiveStake(contract, address),
        this.getClaimableRewards(address, contract),
        this.getUserUnDelegatedList(contract, address),
      ]);

    if (!userUnBondable && !userActiveStake && !claimableRewards) {
      return;
    }

    return new Delegation(
      address,
      contract,
      userUnBondable,
      userActiveStake,
      claimableRewards,
      userUndelegatedList?.undelegatedList
    );
  }

}
