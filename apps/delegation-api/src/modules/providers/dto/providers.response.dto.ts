import { ProviderContract, ProviderIdentity } from '../../../common/services/provider-manager/models/provider-identity';
import { ContractConfigResponseDto } from '../../delegation/dto/contract-config.dto';
import { GlobalContractDataResponseDto } from '../../delegation/dto/global-contract-data-response.dto';
import { elrondConfig } from '../../../config';
import { ContractFeeChanges } from '../../../models/contract-fee-changes';

export class Provider {
  identity: ProviderIdentity;

  contract: string;
  featured: boolean;
  explorerURL: string;
  //Contract Config
  owner?: string;
  serviceFee?: string;
  maxDelegationCap?: string;
  initialOwnerFunds?: string;
  automaticActivation?: boolean;
  withDelegationCap?: boolean;
  changeableServiceFee?: boolean;
  checkCapOnRedelegate?: boolean;
  createdNonce?: number;
  unBondPeriod?: number;
  apr: string;
  aprValue: number;
  feeChanges?: ContractFeeChanges;

  // Contract Data from query contract interogation
  totalActiveStake: string;
  totalUnStaked: string;
  totalCumulatedRewards: string;
  numUsers: number;
  numNodes: number;

  // Computed variables
  maxDelegateAmountAllowed: string;
  maxRedelegateAmountAllowed?: string;
  ownerBelowRequiredBalanceThreshold: boolean;

  constructor(providerContract: ProviderContract
  ) {
    const contract = providerContract.contract;
    this.identity = Object.keys(providerContract).reduce((acc, key) => {
      if (key !== 'contract') {
        acc[key] = providerContract[key];
      }
      return acc;
    }, new ProviderIdentity());
    this.contract = contract;
    this.explorerURL = elrondConfig.explorer + '/providers/' + contract;
    const featuredProviders = process.env.FEATURED_PROVIDERS.split(',');
    this.featured = featuredProviders.includes(this.identity.key);
  }

  setFromContractConfig(contractConfig?: ContractConfigResponseDto){
    this.owner = contractConfig.owner;
    this.serviceFee = contractConfig.serviceFee;
    this.maxDelegationCap = contractConfig.maxDelegationCap;
    this.initialOwnerFunds = contractConfig.initialOwnerFunds;
    this.automaticActivation = contractConfig.automaticActivation;
    this.withDelegationCap = contractConfig.withDelegationCap;
    this.changeableServiceFee = contractConfig.changeableServiceFee;
    this.checkCapOnRedelegate = contractConfig.checkCapOnRedelegate;
    this.createdNonce = contractConfig.createdNonce;
    this.unBondPeriod = contractConfig.unBondPeriod;
    this.apr = contractConfig.apr;
    this.aprValue = contractConfig.aprValue;
  }

  setFromContractData(contractData?: GlobalContractDataResponseDto){
    this.totalActiveStake = contractData.totalActiveStake;
    this.totalUnStaked = contractData.totalUnStaked;
    this.totalCumulatedRewards = contractData.totalCumulatedRewards;
    this.numUsers = contractData.numUsers;
    this.numNodes = contractData.numNodes;
  }

  setFromFeeChanges(feeChanges: ContractFeeChanges) {
    this.feeChanges = feeChanges ?? undefined;
  }
}
