import { Injectable, OnModuleInit } from '@nestjs/common';
import { ElrondElasticService } from '../elrond-communication/elrond-elastic.service';
import { UserContractDeploy } from '../../../models';
import { CacheManagerService } from '../cache-manager/cache-manager.service';

@Injectable()
export class CacheWarmerService implements OnModuleInit {

  constructor(
    private readonly elasticService: ElrondElasticService,
    private readonly cacheManager: CacheManagerService) {
  }

  async onModuleInit() {
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
        contract: contractAddress?.contract
      }
    });

    await this.cacheManager.setAddressContractDeploys(userContractMap);
  }
}
