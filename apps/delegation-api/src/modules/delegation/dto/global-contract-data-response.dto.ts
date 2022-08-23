export class GlobalContractDataResponseDto {
  contract: string;
  totalActiveStake: string;
  totalUnStaked: string;
  totalCumulatedRewards: string;
  numUsers: number;
  numNodes: number;

  constructor(contract: string,
              totalActiveStake: string,
              totalUnStaked: string,
              totalCumulatedRewards: string,
              numUsers: number,
              numNodes: number) {
    this.contract = contract;
    this.totalActiveStake = totalActiveStake;
    this.totalUnStaked = totalUnStaked;
    this.totalCumulatedRewards = totalCumulatedRewards;
    this.numUsers = numUsers;
    this.numNodes = numNodes;
  }
}