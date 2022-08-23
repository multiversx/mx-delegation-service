/**
 * Generic codes
 */
export enum Generic {
  notSupported ='not_supported',
}

export enum DelegationContract {
  errorCallingContract = 'calling_contract',
  errorContractConfig = 'calling_contract_config',
}

/**
 * All error codes returned
 */
export const ErrorCodes = {
  ...Generic, ...DelegationContract
}
