import { InvalidValueError } from '../errors/index.js';
import { Converter } from './converter.js';

export type Sign = '' | '-' | '+';
export type Radix = 10 | 16 | 8 | 2;

export const MAX_SAFE_INTEGER_STRING_MAP = Object.freeze({
  10: Number.MAX_SAFE_INTEGER.toString(),
  16: Number.MAX_SAFE_INTEGER.toString(16),
  8: Number.MAX_SAFE_INTEGER.toString(8),
  2: Number.MAX_SAFE_INTEGER.toString(2)
});

export const INTEGER_PREFIX_MAP = Object.freeze({
  10: '',
  16: '0x',
  8: '0o',
  2: '0b'
});

export class IntegerConverter implements Converter<number | bigint> {
  convertStringToJsValue(str: string, options: { sign: Sign; radix: Radix; }): number | bigint {
    if (
      str.length < MAX_SAFE_INTEGER_STRING_MAP[options.radix].length
      || (
        str.length === MAX_SAFE_INTEGER_STRING_MAP[options.radix].length
        && str <= MAX_SAFE_INTEGER_STRING_MAP[options.radix]
      )
    ) {
      return parseInt(`${options.sign}${str}`, options.radix);
    }

    if (options.radix === 10) {
      return BigInt(`${options.sign}${str}`);
    } else {
      return BigInt(`${INTEGER_PREFIX_MAP[options.radix]}${str}`);
    }
  }

  isJsValue(value: unknown): boolean {
    return Number.isInteger(value) || typeof value === 'bigint';
  }

  convertJsValueToString(value: number | bigint, options: { radix: Radix; }): string {
    if (options.radix !== 10) {
      if (value as number < 0) {
        throw new InvalidValueError('Negative number should only be allowed in decimal representation');
      }
    }
    return `${INTEGER_PREFIX_MAP[options.radix]}${(value as number).toString(options.radix)}`;
  }
}
