import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { cacheConfig } from '../../../config';
import { Provider } from '../../../modules/providers/dto/providers.response.dto';
import BigNumber from 'bignumber.js';
import { UserContractDeploy } from '../../../models';
import { AddressActiveContract } from '../../../models/address-active-contract';
import { ContractFeeChanges } from '../../../models/contract-fee-changes';
import { NetworkConfig, NetworkStatus } from '@multiversx/sdk-network-providers';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

const Keys = {
  allContractAddresses: () => 'allContractAddresses',
  contractConfig: (forContract: string) => `contractConfig.${forContract}`,
  contractFeeChanges: (forContract: string) => `contractFeeChanges.${forContract}`,
  verifyIdentity: (url: string) => `verifyIdentity.${url}`,
  getProfile: (identity: string) => `getProfile.${identity}`,
  newContractCreator: (creator: string) => `newContractCreator.${creator}`,
  blsKeys: (auctionContract: string, delegationContract: string, epoch: number) => `blsKeys.${auctionContract}.${delegationContract}.${epoch}`,
  metaData: (contract: string) => `contractMetaData.${contract}`,
  providerData: (method: string, contract: string) => `${method}.${contract}`,
  totalCumulatedRewards: (contract: string, epoch: number) => `totalCumulatedRewards.${contract}.${epoch}`,
  userActiveStake: (address: string, contract: string) => `userActiveStake.${address}.${contract}`,
  claimableRewards: (address: string, contract: string, epoch: number) => `claimableRewards.${address}.${contract}.${epoch}`,
  userUnBondable: (address: string, contract: string, epoch: number) => `userUnBondable.${address}.${contract}.${epoch}`,
  userUndelegatedList: (address: string, contract: string, epoch: number) => `userUndelegatedList.${address}.${contract}.${epoch}`,
  undelegatedExpiryTime: (address: string, contract: string, amount: string, originalRemainingEpoch: number, epoch: number) => `undelegatedExpiryTime.${address}.${contract}.${amount}.${originalRemainingEpoch}.${epoch}`,
  networkConfig: () => 'networkConfig',
  networkStatus: () => 'networkStatus',
  allProviders: () => 'allProviders',
  getQueueRegisterNonceAndRewardAddress: () => 'getQueueRegisterNonceAndRewardAddress',
  networkStake: () => 'networkStake',
  providerApr: (contract: string, serviceFee: number) => `providerAPR.v2.${contract}.${serviceFee}`,
  accountBalance: (account: string) => `accountBalance.${account}`,
  lastProcessedNonceForShard: (shardId: number) => `lastProcessedNonce:${shardId}`,
  isContractDeployedByAddress: (contract: string, address: string) => `isContractDeployedByAddress.${contract}.${address}`,
  addressContractDeploys: () => 'addressContractDeploys',
  addressActiveContracts: (address: string) => `addressActiveContracts.${address}`,
};

@Injectable()
export class CacheManagerService {

  constructor(
    @Inject(CACHE_MANAGER) protected readonly cacheManager: Cache
  ) { }

  /**
   * getAllContractAddresses
   * @param addresses
   */
  async setAllContractAddresses(addresses: Record<string, any>): Promise<void> {
    await this.set(Keys.allContractAddresses(), addresses, cacheConfig.getAllContractAddresses);
  }
  getAllContractAddresses(): Promise<Record<string, any>> {
    return this.cacheManager.get(Keys.allContractAddresses());
  }

  async deleteAllContractAddresses() {
    await this.cacheManager.del(Keys.allContractAddresses());
  }

  /**
   * getContractConfig
   * @param forContract
   */
  getContractConfig(forContract: string): Promise<Record<string, any>> {
    return this.cacheManager.get(Keys.contractConfig(forContract));
  }
  async setContractConfig(forContract: string, data: Record<string, any>): Promise<void> {
    await this.set(Keys.contractConfig(forContract), data, cacheConfig.getContractConfig);
  }
  async deleteContractConfig(contractAddress: string): Promise<void> {
    await this.cacheManager.del(Keys.contractConfig(contractAddress));
  }

  getBlsKeys(auctionContract: string, delegationContract: string, epoch: number): Promise<Record<string, any>> {
    return this.cacheManager.get(Keys.blsKeys(auctionContract, delegationContract, epoch));
  }
  async setBlsKeys(auctionContract: string, delegationContract: string, epoch: number, data: Record<string, any>): Promise<void> {
    await this.set(Keys.blsKeys(auctionContract, delegationContract, epoch), data, cacheConfig.getBlsKeysStatus);
  }
  async deleteBlsKeys(auctionContract: string, delegationContract: string, epoch: number): Promise<void> {
    await this.cacheManager.del(Keys.blsKeys(auctionContract, delegationContract, epoch));
  }

  /**
   * KeyBase
   * @param url
   */
  getVerifyIdentity(url: string): Promise<boolean> {
    return this.cacheManager.get<boolean>(Keys.verifyIdentity(url));
  }
  async setVerifyIdentity(url: string, isVerified: boolean): Promise<void> {
    const ttl = isVerified ? cacheConfig.verifyIdentity.verified : cacheConfig.verifyIdentity.standard;
    await this.set(Keys.verifyIdentity(url), isVerified, ttl);
  }
  getProfile(identity: string): Promise<Record<string, any>> {
    return this.cacheManager.get(Keys.getProfile(identity));
  }
  async setProfile(identity: string, data: Record<string, any>): Promise<void> {
    await this.set(Keys.getProfile(identity), data, cacheConfig.getProfile);
  }

  /**
   * getMetaData
   * @param contract
   */
  getContractMetadata(contract: string): Promise<Record<string, any>> {
    return this.cacheManager.get(Keys.metaData(contract));
  }
  async setContractMetadata(contract: string, isVerified: boolean, data: Record<string, any>): Promise<void> {
    const ttl = isVerified ? cacheConfig.getMetaData.verified : cacheConfig.getMetaData.standard;
    await this.set(Keys.metaData(contract), data, ttl);
  }

  /**
   * GetTotalActiveStake for an contract
   *
   */
  getProviderData(method: string, contract: string): Promise<Record<string, any>> {
    return this.cacheManager.get<Record<string, any>>(Keys.providerData(method, contract));
  }
  async setProviderData(method: string, contract: string, data: Record<string, any>): Promise<void> {
    await this.set(Keys.providerData(method, contract), data, cacheConfig[method]);
  }

  deleteGetNumNodes(contract: string) {
    return this.cacheManager.del(Keys.providerData('getNumNodes', contract));
  }

  getTotalCumulatedRewards(contract: string, epoch: number): Promise<Record<string, any>> {
    return this.cacheManager.get(Keys.totalCumulatedRewards(contract, epoch));
  }
  async setTotalCumulatedRewards(contract: string, epoch: number, data: Record<string, any>): Promise<void> {
    await this.set(Keys.totalCumulatedRewards(contract, epoch), data, cacheConfig.getTotalCumulatedRewards);
  }

  getUserActiveStake(address: string, contract: string): Promise<Record<string, any>> {
    return this.cacheManager.get(Keys.userActiveStake(address, contract));
  }

  deleteUserActiveStake(address: string, contract: string) {
    return this.cacheManager.del(Keys.userActiveStake(address, contract));
  }

  setUserActiveStake(address: string, contract: string, data: Record<string, any>) {
    return this.set(Keys.userActiveStake(address, contract), data, cacheConfig.getUserActiveStake);
  }

  getUserUnBondable(address: string, contract: string, epoch: number): Promise<Record<string, any>> {
    return this.cacheManager.get(Keys.userUnBondable(address, contract, epoch));
  }
  async setUserUnBondable(address: string, contract: string, epoch: number, data: Record<string, any>): Promise<void> {
    await this.set(Keys.userUnBondable(address, contract, epoch), data, cacheConfig.getUserUnBondable);
  }
  async deleteUserUnBondable(address: string, contract: string, epoch: number): Promise<void> {
    await this.cacheManager.del(Keys.userUnBondable(address, contract, epoch));
  }

  getClaimableRewards(address: string, contract: string, epoch: number): Promise<Record<string, any>> {
    return this.cacheManager.get(Keys.claimableRewards(address, contract, epoch));
  }
  async setClaimableRewards(address: string, contract: string, epoch: number, data: Record<string, any>): Promise<void> {
    await this.set(Keys.claimableRewards(address, contract, epoch), data, cacheConfig.getClaimableRewards);
  }
  async deleteClaimableRewards(address: string, contract: string, epoch: number) {
    await this.cacheManager.del(Keys.claimableRewards(address, contract, epoch));
  }

  /**
   * User Undelegated list
   *
   */
  getUserUndelegatedList(address: string, contract: string, epoch: number): Promise<Record<string, any>> {
    return this.cacheManager.get(Keys.userUndelegatedList(address, contract, epoch));
  }
  async setUserUndelegatedlist(address: string, contract: string, epoch: number, data: Record<string, any>): Promise<void> {
    await this.set(Keys.userUndelegatedList(address, contract, epoch), data, cacheConfig.getUserUnDelegatedList);
  }

  async deleteUserUndelegatedlist(address: string, contract: string, epoch: number): Promise<void> {
    await this.cacheManager.del(Keys.userUndelegatedList(address, contract, epoch));
  }

  getUndelegatedExpireTime(address: string, contract: string, amount: string, originalRemainingEpoch: number, epoch: number): Promise<string> {
    return this.cacheManager.get<string>(Keys.undelegatedExpiryTime(address, contract, amount, originalRemainingEpoch, epoch));
  }
  async setUndelegatedExpireTime(
    address: string,
    contract: string,
    amount: string,
    originalRemainingEpoch: number,
    epoch: number,
    expireDate: string): Promise<void> {
    const expireTime = Date.parse(expireDate);
    // calculate expire seconds based ont expire Date.
    // add a 10 seconds time for buffer.
    const ttlSeconds = (expireTime - Date.now()) / 1000 + 10;
    await this.set(Keys.undelegatedExpiryTime(address, contract, amount, originalRemainingEpoch, epoch), expireDate, parseInt(ttlSeconds.toFixed()));
  }

  getQueueRegisterNonceAndRewardAddress(): Promise<Record<string, any>> {
    return this.cacheManager.get(Keys.getQueueRegisterNonceAndRewardAddress());
  }
  async setQueueRegisterNonceAndRewardAddress(data: Record<string, any>): Promise<void> {
    await this.cacheManager.set(Keys.getQueueRegisterNonceAndRewardAddress(), data, cacheConfig.getQueueRegisterNonceAndRewardAddress);
  }



  /** All providers
   *
   */
  getAllProviders(): Promise<Provider[]> {
    return this.cacheManager.get<Provider[]>(Keys.allProviders());
  }
  async setAllProviders(providers: Provider[]): Promise<void> {
    await this.set(Keys.allProviders(), providers, cacheConfig.allProviders);
  }

  getProviderAPR(contract: string, serviceFee: number): Promise<number> {
    return this.cacheManager.get<number>(Keys.providerApr(contract, serviceFee));
  }
  async setProviderAPR(contract: string, serviceFee: number, data: number) {
    await this.set(Keys.providerApr(contract, serviceFee), data, cacheConfig.providerApr);
  }
  async deleteProviderAPR(contract: string, serviceFee: number): Promise<void> {
    await this.cacheManager.del(Keys.providerApr(contract, serviceFee));
  }

  /**
   * Network config
   * @param networkConfig
   */
  setNetworkConfig(networkConfig: NetworkConfig): Promise<void> {
    return this.set(Keys.networkConfig(),
      {
        ...networkConfig,
        TopUpRewardsGradientPointString: networkConfig.TopUpRewardsGradientPoint.toString(),
      },
      cacheConfig.networkConfig);
  }
  async getNetworkConfig(): Promise<NetworkConfig> {
    const result = await this.cacheManager.get<NetworkConfig>(Keys.networkConfig());
    if (!!result) {
      result.TopUpRewardsGradientPoint = new BigNumber(result['TopUpRewardsGradientPointString']);
    }
    return result;
  }

  getNetworkStake(): Promise<Record<string, any>> {
    return this.cacheManager.get<Record<string, any>>(Keys.networkStake());
  }
  async setNetworkStake(data: Record<string, any>): Promise<void> {
    await this.set(Keys.networkStake(), data, cacheConfig.networkStake);
  }
  /**
   * Network status
   * @param networkStatus
   */
  setNetworkStatus(networkStatus: NetworkStatus): Promise<void> {
    return this.set(Keys.networkStatus(), networkStatus, cacheConfig.networkStatus);
  }

  getNetworkStatus(): Promise<NetworkStatus> {
    return this.cacheManager.get<NetworkStatus>(Keys.networkStatus());
  }

  setAccountBalance(account: string, acountBalance: BigNumber): Promise<void> {
    return this.set(Keys.accountBalance(account), acountBalance.toString(10), cacheConfig.ownerAccount);
  }

  async getAccountBalance(account: string): Promise<BigNumber> {
    const balance = await this.cacheManager.get(Keys.accountBalance(account));
    if (!!balance) {
      return new BigNumber(balance.toString());
    }
    return null;
  }

  getLongTermCache(key: string): Promise<any> {
    return this.cacheManager.get(key);
  }

  setLongTermCache(key: string, value: any): Promise<void> {
    return this.set(key, value, cacheConfig.longTermCache);
  }

  getLastProcessedNonce(shardId: number): Promise<number | undefined> {
    return this.cacheManager.get(Keys.lastProcessedNonceForShard(shardId));
  }
  async setLastProcessedNonce(shardId: number, nonce: number): Promise<any> {
    return await this.set(Keys.lastProcessedNonceForShard(shardId), nonce, 3600 * 24 * 7); // one week
  }

  getNewContractCreator(creator: string): Promise<boolean | undefined> {
    return this.cacheManager.get(Keys.newContractCreator(creator));
  }
  async setNewContractCreator(creator: string): Promise<any> {
    return await this.set(Keys.newContractCreator(creator), true, 60); // one minute
  }

  getIsContractDeployedByAddress(contract: string, address: string): Promise<boolean | undefined> {
    return this.cacheManager.get(Keys.isContractDeployedByAddress(contract, address));
  }
  async setIsContractDeployedByAddress(contract: string, address: string, isDeployed: boolean): Promise<any> {
    const ttl = isDeployed ? cacheConfig.isContractDeployedByAddress.true : cacheConfig.isContractDeployedByAddress.false;
    return await this.set(Keys.isContractDeployedByAddress(contract, address), isDeployed, ttl);
  }
  deleteIsContractDeployedByAddress(contract: string, address: string) {
    return this.cacheManager.del(Keys.isContractDeployedByAddress(contract, address));
  }

  getAddressContractDeploys(): Promise<UserContractDeploy[]> {
    return this.cacheManager.get(Keys.addressContractDeploys());
  }
  async setAddressContractDeploys(userContractDeploys: UserContractDeploy[]): Promise<any> {
    return await this.set(Keys.addressContractDeploys(), userContractDeploys, cacheConfig.userContractDeploys);
  }

  getAddressActiveContracts(address: string): Promise<AddressActiveContract[]> {
    return this.cacheManager.get(Keys.addressActiveContracts(address));
  }
  async setAddressActiveContracts(address: string, contracts: AddressActiveContract[]): Promise<void> {
    await this.set(Keys.addressActiveContracts(address), contracts, cacheConfig.addressActiveContracts);
  }
  async deleteAddressActiveContracts(address: string): Promise<void> {
    await this.cacheManager.del(Keys.addressActiveContracts(address));
  }

  getContractFeeChange(forContract: string): Promise<ContractFeeChanges> {
    return this.cacheManager.get(Keys.contractFeeChanges(forContract));
  }
  async setContractFeeChange(forContract: string, data: ContractFeeChanges): Promise<void> {
    await this.set(Keys.contractFeeChanges(forContract), data, cacheConfig.getContractFeeChanges);
  }

  set(key: string, value: any, ttl: number): Promise<void> {
    if (!value) {
      return;
    }

    if (ttl <= -1) {
      return this.cacheManager.set(key, value);
    } else {
      return this.cacheManager.set(key, value, { ttl });
    }
  }

  get<T>(key: string): Promise<T | undefined> {
    return this.cacheManager.get<T>(key);
  }
}
