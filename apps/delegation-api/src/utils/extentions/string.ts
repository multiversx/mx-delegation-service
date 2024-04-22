import { Account, Address } from '@multiversx/sdk-core';
import BigNumber from 'bignumber.js';

declare global {
  interface String {
    base64ToUtf8(): string;
    base64ToHex(): string;
    base64ToBech32(): string;
    hexToBech32(): string;
    hexBigNumberToString(): string;
    makeId(length: number): string;
    hexToNumber(): number;
    hexToAscii(): string;
  }
}
String.prototype.base64ToUtf8 = function () {
  const buffer = Buffer.from(this, 'base64');
  return buffer.toString('utf-8');
};
String.prototype.base64ToHex = function () {
  const buffer = Buffer.from(this, 'base64');
  return buffer.toString('hex');
};

String.prototype.base64ToBech32 = function () {
  const address = this.base64ToHex();
  return address.hexToBech32();
};

String.prototype.hexToBech32 = function () {
  return (new Account(Address.fromHex(this)).address.bech32());
};

String.prototype.hexToNumber = function () {
  return parseInt(this, 16);
};

String.prototype.hexToAscii = function () {
  return Buffer.from(this, 'hex').toString();
};

String.prototype.makeId = function (length) {
  let result = '';
  const charactersLength = this.length;
  for (let i = 0; i < length; i++) {
    result += this.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

String.prototype.hexBigNumberToString = function () {
  return (new BigNumber(this, 16).toString(10)).toString();
};
export { };
