import { UserUndelegatedItem } from './user-undelegated-list.dto';

export class Delegation {
  address: string;
  contract: string;
  userUnBondable: string;
  userActiveStake: string;
  claimableRewards: string;
  userUndelegatedList: UserUndelegatedItem[];

  constructor(
    address: string,
    contract: string,
    userUnBondable: string,
    userActiveStake: string,
    claimableRewards: string,
    userUndelegatedList: UserUndelegatedItem[]
  ) {
    this.address = address;
    this.contract = contract;
    this.userUnBondable = userUnBondable;
    this.userActiveStake = userActiveStake;
    this.claimableRewards = claimableRewards;
    this.userUndelegatedList = userUndelegatedList;
  }
}
