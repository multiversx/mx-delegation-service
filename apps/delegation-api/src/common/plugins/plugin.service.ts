import { Injectable } from '@nestjs/common';

@Injectable()
export class PluginService {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async onProviderFeeChanged(contractAddress: string, args: string[]): Promise<void> { }
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async onProviderTotalDelegationCapServiceChanged(contractAddress: string, from: string, args: string[]): Promise<void> { }
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async onDelegate(senderAddress: string, contractAddress: string): Promise<void> { }
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async onUnDelegate(senderAddress: string, contractAddress: string): Promise<void> { }
}
