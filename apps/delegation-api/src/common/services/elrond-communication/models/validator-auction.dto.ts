export class MultiversXApiValidatorAuction {
  owner: string;
  numStakedNodes: number;
  nodes: MultiversXApiValidatorAuctionNode[];
}

export class MultiversXApiValidatorAuctionNode {
  blsKey: string;
  qualified: boolean;
}

export class MultiversXApiValidatorAuctionResponse {
  data: {
    auctionList: MultiversXApiValidatorAuction[];
  };
}
