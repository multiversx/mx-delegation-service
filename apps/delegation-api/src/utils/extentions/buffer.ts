import BigNumber from 'bignumber.js';
import { decodeBigNumber, decodeBool, decodeUnsignedNumber } from '@multiversx/sdk-core';

declare global {
  interface Buffer {
    asString(): string;
    asBigInt(): BigNumber;
    asFixed(): string;
    asHex(): string;
    asBool(): boolean;
    asNumber(): number;
  }
}

Buffer.prototype.asString = function () {
  return this.toString('utf-8');
};

Buffer.prototype.asBigInt = function () {
  return decodeBigNumber(this);
};

Buffer.prototype.asFixed = function () {
  return this.asBigInt().toFixed();
};

Buffer.prototype.asHex = function () {
  return this.toString('hex');
};

Buffer.prototype.asBool = function () {
  if (!this) {
    return false;
  }
  if (this.length > 1) {
    return this.asString().toLowerCase() === 'true';
  }
  return decodeBool(this);
};

Buffer.prototype.asNumber = function () {
  return decodeUnsignedNumber(this);
};

export { };
