import { Injectable } from '@nestjs/common';

@Injectable()
export class PluginService {

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onProviderFeeChanged(contractAddress: string, args: string[]): Promise<void> { return; }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onProviderTotalDelegationCapServiceChanged(contractAddress: string, from: string, args: string[]): Promise<void> { return; }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onDelegate(senderAddress: string, contractAddress: string): Promise<void> { return; }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onUnDelegate(senderAddress: string, contractAddress: string): Promise<void> { return; }
}
