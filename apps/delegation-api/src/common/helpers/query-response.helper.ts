import { QueryResponse } from '@elrondnetwork/erdjs/out/smartcontracts';

export class QueryResponseHelper {
  static handleQueryAmountResponse(response: QueryResponse): string {
    return response?.returnData[0]?.asBigInt.toFixed();
  }

  static getDataForCache(queryResponse: QueryResponse) {
    return {
      ...queryResponse,
      returnData: queryResponse.returnData.map(r => r.asBase64)
    };
  }
}