import { ContractConfigResponseDto } from '../../delegation/dto/contract-config.dto';
import { ProviderContract } from '../../../common/services/provider-manager/models/provider-identity';
import { GlobalContractDataResponseDto } from '../../delegation/dto/global-contract-data-response.dto';

export class ProviderWithData {
  identity: ProviderContract;
  contractData?: ContractConfigResponseDto;
  globalData?: GlobalContractDataResponseDto;

  constructor(identity: ProviderContract,
              providerContractData: ContractConfigResponseDto = null,
              providerGlobalData: GlobalContractDataResponseDto = null
  ) {
    this.identity = identity;
    if (providerContractData) {
      this.contractData = providerContractData;
    }

    if (providerGlobalData) {
      this.globalData = providerGlobalData;
    }
  }
}
