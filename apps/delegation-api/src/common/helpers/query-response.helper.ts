import { ContractQueryResponse } from '@elrondnetwork/erdjs-network-providers';

export class QueryResponseHelper {

  static handleQueryAmountResponse(response: ContractQueryResponse): string {
    if (!response?.returnData[0]) {
      return '0';
    }
    return response.getReturnDataParts()[0].asFixed();
  }

}
