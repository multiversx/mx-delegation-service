export class UserUndelegatedListDto {
  address: string;
  contract: string;
  undelegatedList:  UserUndelegatedItem[];

  constructor(address: string, contract: string, undelegatedList: UserUndelegatedItem[]) {
    this.address = address;
    this.contract = contract;
    this.undelegatedList = undelegatedList;
  }
}

export class UserUndelegatedItem {
  amount: string;
  seconds: number;
  remainingEpochsNumber?: number;

  constructor(amount: string, seconds: number) {
    this.amount = amount;
    this.seconds = seconds;
  }
}
