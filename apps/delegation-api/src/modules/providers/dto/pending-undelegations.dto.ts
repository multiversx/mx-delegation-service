export class PendingUndelegationsDto {
  contract: string;
  epoch: number[];

  constructor(contract: string, epoch: number[]) {
    this.contract = contract;
    this.epoch = epoch;
  }
}
