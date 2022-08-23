import { Injectable } from '@nestjs/common';

@Injectable()
export class PluginService {
  async onProviderFeeChanged(contractAddress: string, args: string[]): Promise<void> { }
  async onProviderTotalDelegationCapServiceChanged(contractAddress: string, from: string, args: string[]): Promise<void> { }
  async onDelegate(senderAddress: string, contractAddress: string): Promise<void> { }
  async onUnDelegate(senderAddress: string, contractAddress: string): Promise<void> { }
}
