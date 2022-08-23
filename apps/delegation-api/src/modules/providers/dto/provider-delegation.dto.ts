import { AddressActiveContract } from '../../../models/address-active-contract';

export class ProviderDelegation {
  address: string;
  contract: string;
  activeStake: string;
  activeStakeNum: number;

  static fromAddressActiveContract(addressActiveContract: AddressActiveContract): ProviderDelegation {
    const providerDelegation = new ProviderDelegation();
    providerDelegation.address = addressActiveContract.address;
    providerDelegation.contract = addressActiveContract.contract;
    providerDelegation.activeStake = addressActiveContract.activeStake;
    providerDelegation.activeStakeNum = addressActiveContract.activeStakeNum;
    return providerDelegation;
  }
}
