import { Injectable } from '@nestjs/common';

@Injectable()
export class PluginService {

  onProviderFeeChanged(contractAddress: string, args: string[]): Promise<void> { return; }
  onProviderTotalDelegationCapServiceChanged(contractAddress: string, from: string, args: string[]): Promise<void> { return; }
  onDelegate(senderAddress: string, contractAddress: string): Promise<void> { return; }
  onUnDelegate(senderAddress: string, contractAddress: string): Promise<void> { return; }
}
