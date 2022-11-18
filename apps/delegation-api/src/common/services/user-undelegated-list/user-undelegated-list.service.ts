import { Injectable } from '@nestjs/common';
import { ElrondProxyService } from '../elrond-communication/elrond-proxy.service';
import { UserUndelegatedItem } from '../../../models/user-undelegated-list.dto';
import { CacheManagerService } from '../cache-manager/cache-manager.service';

@Injectable()
export class UserUndelegatedListService {

  constructor(
    private elrondProxyService: ElrondProxyService,
    private cacheManagerService: CacheManagerService,
  )
  { }

  async get(contract: string, address: string, withRemainingEpochs= false): Promise<UserUndelegatedItem[] | null> {
    try {
      const scResponse = await this.elrondProxyService.getUserUnDelegatedList(
        address,
        contract
      );

      if (!scResponse.returnData || scResponse.returnData.length === 0) {
        return null;
      }

      const networkConfig = await this.elrondProxyService.getNetworkConfig();
      const networkStatus = await this.elrondProxyService.getNetworkStatus();
      if (!networkConfig.RoundsPerEpoch) {
        networkConfig.RoundsPerEpoch = networkStatus.RoundsPerEpoch;
      }

      const undelegatedList = scResponse.getReturnDataParts();
      const results = [];
      for(let index = 0; index < undelegatedList.length - 1; index = index + 2) {
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
          const undelegatedItem = new UserUndelegatedItem(
            amount,
            cachedSecondsLeft,
          );
          if (withRemainingEpochs) {
            undelegatedItem.remainingEpochsNumber = remainingEpochsNumber;
          }
          results.push(undelegatedItem);
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

        const undelegatedItem = new UserUndelegatedItem(
          amount,
          secondsLeft,
        );
        if (withRemainingEpochs) {
          undelegatedItem.remainingEpochsNumber = remainingEpochsNumber;
        }
        results.push(undelegatedItem);

      }

      return results;
    } catch (e) {
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
}
