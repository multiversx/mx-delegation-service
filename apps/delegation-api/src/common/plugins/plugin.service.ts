import { Injectable } from '@nestjs/common';

@Injectable()
export abstract class PluginService {
  abstract onProviderFeeChanged(contractAddress: string, args: string[]): Promise<void>;
  abstract onProviderTotalDelegationCapServiceChanged(contractAddress: string, from: string, args: string[]): Promise<void>;
  abstract onDelegate(senderAddress: string, contractAddress: string): Promise<void>;
  abstract onUnDelegate(senderAddress: string, contractAddress: string): Promise<void>;
}
