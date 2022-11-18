import { Injectable, OnModuleInit } from '@nestjs/common';
import { ElrondElasticService } from '../elrond-communication/elrond-elastic.service';
import { UserContractDeploy } from '../../../models';
import { CacheManagerService } from '../cache-manager/cache-manager.service';
import { UserUndelegatedListService } from '../user-undelegated-list/user-undelegated-list.service';
import { ProviderManagerService } from '../provider-manager/provider-manager.service';

@Injectable()
export class CacheWarmerService implements OnModuleInit {

  constructor(
    private readonly elasticService: ElrondElasticService,
    private readonly cacheManager: CacheManagerService,
    private readonly userUndelegatedListService: UserUndelegatedListService,
    private readonly providerManagerService: ProviderManagerService,
  )
  { }

  async onModuleInit() {
    await this.getPendingUndelegations();
    await this.cacheStakingContractDeployedContracts();
  }

  async cacheStakingContractDeployedContracts() {
    const contractDeployTxes = await this.elasticService.getStakingContractDeploysTxHashes();
    const txHashes = contractDeployTxes.map(tx => tx.txHash);
    const transactions = await this.elasticService.getTransactionsByHashes(txHashes);
    const userContractMap: UserContractDeploy[] = transactions.map(tx => {
      const contractAddress = contractDeployTxes.find(contract => contract.txHash = tx.hash);
      return {
        userAddress: tx.sender,
        txHash: tx.hash,
        contract: contractAddress?.contract,
      };
    });

    await this.cacheManager.setAddressContractDeploys(userContractMap);
  }

  async getPendingUndelegations() {
    const providerAddresses = await this.providerManagerService.getAllContractAddresses();
    for (const contract of providerAddresses) {
      await this.getPendingUndelegationsForContract(contract);
    }
  }

  async getPendingUndelegationsForContract(contract: string) {
    let data;
    const totalForEpochs: number[] = [0,0,0,0,0,0,0,0,0,0];
    do {
      data = await this.elasticService.getDelegationsForContractWithCursor(contract, data?.cursor);
      if (!data){
        continue;
      }
      for(const stakingData of data.items) {
        const userUndelegatedList = await this.userUndelegatedListService.get(contract, stakingData.address, true);
        if (!userUndelegatedList) {
          continue;
        }
        for (const listItem of userUndelegatedList) {
          if (listItem.remainingEpochsNumber >= totalForEpochs.length) {
            continue;
          }
          totalForEpochs[listItem.remainingEpochsNumber]++;
        }
      }
    } while (data);

    await this.cacheManager.setTotalUndelegatingAddressesForContract(contract, totalForEpochs);
  }
}
