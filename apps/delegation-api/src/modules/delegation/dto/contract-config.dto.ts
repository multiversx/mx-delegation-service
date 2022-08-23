import { ContractReturnData } from '@elrondnetwork/erdjs/out/smartcontracts/query';

export class ContractConfigResponseDto {
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

  static fromContractConfig(contractConfig: ContractReturnData[]): ContractConfigResponseDto {
    const response = new ContractConfigResponseDto();
    response.owner = contractConfig[0]?.asHex.hexToBech32();
    response.serviceFee = contractConfig[1]?.asBigInt.toFixed();
    response.maxDelegationCap = contractConfig[2]?.asBigInt.toFixed();
    response.initialOwnerFunds = contractConfig[3]?.asBigInt.toFixed();
    response.automaticActivation = contractConfig[4]?.asBool;
    response.withDelegationCap = contractConfig[5]?.asBool;
    response.changeableServiceFee = contractConfig[6]?.asBool;
    response.checkCapOnRedelegate = contractConfig[7]?.asBool;
    response.createdNonce = contractConfig[8]?.asNumber;
    response.unBondPeriod = contractConfig[9]?.asNumber;

    return response;
  }
}
