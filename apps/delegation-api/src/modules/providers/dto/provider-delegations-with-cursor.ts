import { ProviderDelegation } from './provider-delegation.dto';

export class ProviderDelegationsWithCursor {
  delegations: ProviderDelegation[];
  cursor: string;

  constructor(delegations: ProviderDelegation[], cursor: string) {
    this.delegations = delegations;
    this.cursor = cursor;
  }
}
