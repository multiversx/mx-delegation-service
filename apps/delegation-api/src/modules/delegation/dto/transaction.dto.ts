export class TransactionRequestDto {
  /**
   * The nonce of the transaction (the account sequence number of the sender).
   */
  nonce: number;
  /**
   * The value to transfer.
   */
  value: string;
  /**
   * The address of the sender.
   */
  sender: string;
  /**
   * The address of the receiver.
   */
  receiver: string;
  /**
   * The gas price to be used.
   */
  gasPrice: number;
  /**
   * The maximum amount of gas to be consumed when processing the transaction.
   */
  gasLimit: number;
  /**
   * The payload of the transaction.
   */
  data: string;
  /**
   * The chain ID of the Network (e.g. "1" for Mainnet).
   */
  chainID: string;
  /**
   * The version, required by the Network in order to correctly interpret the contents of the transaction.
   */
  version: number;
  /**
   * The signature.
   */
  signature: string;
}

export class TransactionResponseDto {

}
