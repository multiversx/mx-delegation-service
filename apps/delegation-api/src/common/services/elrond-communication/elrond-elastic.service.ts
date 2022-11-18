import { Inject, Injectable } from '@nestjs/common';
import { elrondConfig } from '../../../config';
import { Client } from '@elastic/elasticsearch';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { ContractDeployTx, ElasticTransaction, SearchAfterResponse } from '../../../models';
import { AddressActiveContract } from '../../../models/address-active-contract';

/**
 * Service used for Elrond Elastic endpoint requests;
 */
@Injectable()
export class ElrondElasticService {
  /**
   * Elastic search client
   */
  private transactionsClient: Client;
  private scDeploysClient: Client;
  private delegatorsClient: Client;
  private readonly PAGE_SIZE = 200;
  /**
   * Set the correct host to be used
   */
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger
  ) {
    this.transactionsClient = new Client({
      node: elrondConfig.elastic + '/transactions',
      requestTimeout: parseInt(process.env.KEEPALIVE_TIMEOUT_DOWNSTREAM),
      agent: {
        keepAlive: true,
        keepAliveMsecs: parseInt(process.env.KEEPALIVE_TIMEOUT_DOWNSTREAM),
      },
    });

    this.scDeploysClient = new Client({
      node: elrondConfig.elastic + '/scdeploys',
      requestTimeout: parseInt(process.env.KEEPALIVE_TIMEOUT_DOWNSTREAM),
      agent: {
        keepAlive: true,
        keepAliveMsecs: parseInt(process.env.KEEPALIVE_TIMEOUT_DOWNSTREAM),
      },
    });

    this.delegatorsClient = new Client({
      node: elrondConfig.elastic + '/delegators',
      requestTimeout: parseInt(process.env.KEEPALIVE_TIMEOUT_DOWNSTREAM),
      agent: {
        keepAlive: true,
        keepAliveMsecs: parseInt(process.env.KEEPALIVE_TIMEOUT_DOWNSTREAM),
      },
    });
  }

  async getStakingContractDeploysTxHashes(): Promise<ContractDeployTx[]> {
    const stakingContractAddress = elrondConfig.stakingContract;
    const body = {
      'query': {
        'bool': {
          'must': [
            {
              'match': {
                'deployer': stakingContractAddress,
              },
            },
          ],
        },
      },
    };
    try {
      const response = await this.scDeploysClient.search({
        body,
      });
      return response.body.hits.hits.map(hit => {
        return {
          txHash: hit._source?.deployTxHash,
          contract: hit._id,
        };
      });
    } catch (e) {
      this.logger.error('Fail to getStakingContractDeploysTxHashes', {
        path: 'elrond-elastic.service.getStakingContractDeploysTxHashes',
        exception: e.toString(),
      });
      throw e;
    }
  }

  async getTransactionsByHashes(txHashes: string[]): Promise<ElasticTransaction[]> {
    const body = {
      query: {
        ids: {
          values: txHashes,
        },
      },
    };
    try {
      const response = await this.transactionsClient.search({
        body,
      });

      return response.body.hits?.hits?.map(hit => {
        return {
          hash: hit._id,
          ...hit._source,
        };
      });
    } catch (e) {
      this.logger.error('Fail to getTransactionByHashes', {
        path: 'elrond-elastic.service.getTransactionByHashes',
        exception: e.toString(),
      });
      throw e;
    }
  }

  async getAddressActiveContracts(address: string): Promise<AddressActiveContract[]> {
    const body = {
      size: 200,
      'query': {
        'bool': {
          'must': [
            {
              'match': {
                'address': address,
              },
            },
          ],
        },
      },
    };
    try {
      const response = await this.delegatorsClient.search({
        body,
      });
      return response.body.hits.hits.map(hit => hit._source);
    } catch (e) {
      this.logger.error('Fail to getDelegationsForAddress', {
        path: 'elrond-elastic.service.getDelegationsForAddress',
        exception: e.toString(),
      });
      throw e;
    }
  }

  async getDelegationForAddressAndContract(address: string, contract: string): Promise<AddressActiveContract | null> {
    const body = {
      'query': {
        'bool': {
          'must': [
            {
              'match': {
                'address': address,
              },
            },
            {
              'match': {
                'contract': contract,
              },
            },
          ],
        },
      },
    };
    try {
      const response = await this.delegatorsClient.search({
        body,
      });
      if (response.body.hits.hits.length) {
        return response.body.hits.hits[0]._source;
      } else {
        return null;
      }
    } catch (e) {
      this.logger.error('Fail to getDelegatorsForAddress', {
        path: 'elrond-elastic.service.getDelegatorsForAddress',
        exception: e.toString(),
      });
      throw e;
    }
  }

  async getDelegationsForContract(contract: string, page: number): Promise<AddressActiveContract[] | null> {
    const body = {
      from: (page - 1) * this.PAGE_SIZE,
      size: this.PAGE_SIZE,
      'query': {
        'bool': {
          'must': [
            {
              'match': {
                'contract': contract,
              },
            },
          ],
        },
      },
    };
    try {
      const response = await this.delegatorsClient.search({
        body,
      });
      if (response.body.hits.hits.length) {
        return response.body.hits.hits.map(e => e._source);
      } else {
        return null;
      }
    } catch (e) {
      this.logger.error('Fail to getDelegationsForContract', {
        path: 'elrond-elastic.service.getDelegationsForContract',
        exception: e.toString(),
      });
      throw e;
    }
  }

  async getDelegationsForContractWithCursor(contract: string, cursor: string | null = null): Promise<SearchAfterResponse<AddressActiveContract> | null> {
    const body = {
      size: this.PAGE_SIZE,
      'query': {
        'bool': {
          'must': [
            {
              'match': {
                'contract': contract,
              },
            },
          ],
        },
      },
      sort: {
        _id: {
          order: 'asc',
        },
      },
    };
    if (cursor) {
      body['search_after'] = [cursor];
    }

    try {
      const response = await this.delegatorsClient.search({ body });
      if (response.body.hits.hits.length) {
        return new SearchAfterResponse(response.body.hits.hits.map(e => e._source), response.body.hits.hits[response.body.hits.hits.length - 1].sort[0]);
      } else {
        return null;
      }
    } catch (e) {
      this.logger.error('Fail to getDelegationsForContractWithCursor', {
        path: 'elrond-elastic.service.getDelegationsForContractWithCursor',
        exception: e.toString(),
      });
      throw e;
    }
  }
}
