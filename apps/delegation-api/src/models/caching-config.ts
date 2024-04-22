/**
 * Caching times expressed in seconds
 */
export class CachingConfig {
  getAllContractAddresses: number;
  getContractConfig: number;
  getContractFeeChanges: number;
  getBlsKeysStatus: number;
  getMetaData: CacheWithVerify;

  getUserUnBondable: number;
  getUserActiveStake: number;
  getClaimableRewards: number;
  getUserUnDelegatedList: number;

  providerApr: number;
  getTotalActiveStake: number;
  getTotalUnStaked: number;
  getTotalCumulatedRewards: number;
  getNumUsers: number;
  getNumNodes: number;
  getQueueRegisterNonceAndRewardAddress: number;

  allProviders: number;

  // keybase
  verifyIdentity: CacheWithVerify;
  getProfile: number;

  // network config and network status
  networkConfig: number;
  networkStatus: number;
  networkStake: number;
  ownerAccount: number;

  isContractDeployedByAddress: {
    'false': number,
    'true': number
  };

  userContractDeploys: number;

  //LongTerm Cache
  longTermCache: number;
  addressActiveContracts: number;
  delegationForContract: number;
}

class CacheWithVerify {
  standard: number;
  verified: number;
}
