import { Inject, Injectable } from '@nestjs/common';
import { ProviderContract } from './models/provider-identity';
import { ElrondProxyService } from '../elrond-communication/elrond-proxy.service';
import { BadRequest } from '../../errors';
import { ErrorCodes } from '../../../utils';
import { ProviderWithData } from '../../../modules/providers/dto/provider-with-data.dto';
import asyncPool from 'tiny-async-pool';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { ProfileLoaderService } from './profile/loader/profile-loader.service';
import { IdentitiesLoaderService } from './identities-loader/identities-loader.service';

@Injectable()
export class ProviderManagerService {
  constructor(
    private elrondProxyService: ElrondProxyService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly profileLoaderService: ProfileLoaderService,
    private readonly identitiesLoaderService: IdentitiesLoaderService,
  ) {
  }

  async getAllProvidersWithData(contracts: string[]): Promise<ProviderWithData[]> {
    const providersWitInfo = await asyncPool(4, contracts, contract => this.getProviderInfo(contract));

    return providersWitInfo
      .filter(provider => !!provider)
      .map(provider => new ProviderWithData(provider));
  }

  async getProviderInfo(contract: string): Promise<ProviderContract> {
    const providerInfo = new ProviderContract(contract);
    try {
      const contractMeta = await this.elrondProxyService.getContractMetaData(contract);
      let identityKey = await this.identitiesLoaderService.loadByOwner(contract);
      if (contractMeta.returnMessage !== '') {
        const returnBuffers: Buffer[] = contractMeta.getReturnDataParts();
        if (returnBuffers[2] != null) {
          identityKey = returnBuffers[2].asString();
        }
      }

      if (identityKey == null) {
        return providerInfo;
      }

      providerInfo.key = identityKey;

      const profile = await this.profileLoaderService.load(identityKey);
      if (profile == null) {
        return providerInfo;
      }

      providerInfo.name = profile.name;
      providerInfo.avatar = profile.avatar_url;
      providerInfo.description = profile.bio;
      providerInfo.twitter = profile.twitter_username;
      providerInfo.location = profile.location;
      providerInfo.url = profile.blog;

      return providerInfo;
    } catch (e) {
      this.logger.info('Error getting provider Info', {
        path: 'provider-manager.service.getProviderInfo',
        contract: contract,
        exception: e.toString(),
      });
      return providerInfo;
    }
  }

  async getAllContractAddresses(): Promise<string[]> {
    try {
      const scResponse = await this.elrondProxyService.getAllContractAddresses();
      const data: Buffer[] = scResponse.getReturnDataParts();
      if (!data) {
        return null;
      }

      return data.map((contract) => {
        return contract.asHex().hexToBech32();
      });
    } catch (e) {
      this.logger.error('Error getting Contract addresses', {
        path: 'provider-manager.service.getAllContractAddresses',
        exception: e.toString(),
      });
      throw BadRequest.fromError({
        message: 'Error calling getContractList',
        error: ErrorCodes.errorCallingContract,
      });
    }
  }

}
