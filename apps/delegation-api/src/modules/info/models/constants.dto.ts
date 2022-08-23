export class Constants {
  gasPrice: number;
  chainID : string;
  version : number;
  gasLimit : ConstantsGasLimit;
}

export class ConstantsGasLimit {
  delegate: number;
  unDelegate: number;
  withdraw: number;
  claimRewards: number;
  reDelegateRewards: number;
}
