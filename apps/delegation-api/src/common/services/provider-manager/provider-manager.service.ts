import { Inject, Injectable } from '@nestjs/common';
import { ProviderContract } from './models/provider-identity';
import { ElrondProxyService } from '../elrond-communication/elrond-proxy.service';
import { KeyBaseService } from '../elrond-communication/keybase.service';
import { BadRequest } from '../../errors';
import { ErrorCodes } from '../../../utils';
import { ProviderWithData } from '../../../modules/providers/dto/provider-with-data.dto';
import asyncPool from 'tiny-async-pool'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class ProviderManagerService {
  constructor(
    private elrondProxyService: ElrondProxyService,
    private keyBaseService: KeyBaseService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger
  ) {
  }

  async getAllProvidersWithData(contracts: string[]): Promise<ProviderWithData[]> {
    const providersWitInfo = await asyncPool(4, contracts, contract => this.getProviderInfo(contract))

    return providersWitInfo
      .filter(provider => !!provider)
      .map(provider => new ProviderWithData(provider));
  }

  async getProviderInfo(contract: string) : Promise<ProviderContract> {
    const providerInfo = new ProviderContract(contract);
    try {
      const contractMeta = await this.elrondProxyService.getContractMetaData(contract);
      if (contractMeta.returnMessage !== '') {
        return providerInfo;
      }

      const identityKey = contractMeta.returnData[2]?.asString;

      const verify = await this.keyBaseService.verifyIdentity(identityKey, contract);
      if (!verify) {
        return providerInfo;
      }

      // if provider is verified extend ttl
      // TODO: find a better solution for this. For now it will just extend the cache indefinitely, which is not good
      // await this.cacheManagerService.setContractMetadata(contract, true, QueryResponseHelper.getDataForCache(contractMeta));

      providerInfo.key = identityKey;

      const profile = await this.keyBaseService.getProfile(providerInfo.key);
      providerInfo.name = profile.them?.profile?.full_name;
      providerInfo.avatar = profile.them?.pictures?.primary?.url;
      providerInfo.description = profile.them?.profile?.bio;
      providerInfo.twitter = profile.them?.profile?.twitter;
      providerInfo.location = profile.them?.profile?.location;

      if (profile.them.proofs_summary.all) {
        for (const proof of profile.them.proofs_summary.all) {
          switch (proof.proof_type) {
            case 'twitter' :
              providerInfo.twitter = proof.service_url;
              break;
            case 'github' :
              providerInfo.github = proof.service_url;
              break;
            case 'dns':
            case 'generic_web_site':
              providerInfo.url = proof.service_url;
              break;
          }
        }
      }

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
      const data = scResponse.returnData;
      if (!data) {
        return null;
      }

      return data.map((contract) => {
        return contract.asHex.hexToBech32()
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
