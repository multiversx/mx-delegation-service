export class ElasticTransaction {
  miniBlockHash: string;
  hash: string;
  nonce: number;
  round: number;
  value: string;
  receiver: string;
  sender: string;
  receiverShard: number;
  senderShard: number;
  gasPrice: number;
  gasLimit: number;
  gasUsed: number;
  fee: string;
  data: string;
  signature: string;
  timestamp: number;
  status: string;
  searchOrder: number;
  hasScResults: boolean;
  isScCall: boolean;
}