export class ProviderIdentity {
  key: string;
  name: string;
  description: string;
  avatar: string;
  url: string;
  twitter: string;
  location: string;
  github: string;
}

export class ProviderContract extends ProviderIdentity {
  contract: string;

  constructor(contract: string) {
    super();
    this.contract = contract;
  }
}
