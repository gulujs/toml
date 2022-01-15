import {
  RE_INTEGER,
  STR_MAX_SAFE_INTEGER_BINARY,
  STR_MAX_SAFE_INTEGER_DECIMAL,
  STR_MAX_SAFE_INTEGER_HEX,
  STR_MAX_SAFE_INTEGER_OCTAL
} from '../constants.js';
import {
  InvalidValueError,
  PRETTY_ERROR_MESSAGE,
  SYNTAX_ERROR_MESSAGE
} from '../errors/index.js';
import {
  Convertor,
  Sign,
  ValueResult
} from '../interfaces.js';
import { Source } from '../source.js';


export function getInteger(source: Source, offset: number, convertor: Convertor): ValueResult | null {
  RE_INTEGER.lastIndex = offset;
  const matches = RE_INTEGER.exec(source.line);
  if (!matches || matches.index !== offset) {
    return null;
  }

  let value!: number | BigInt | unknown;
  if (matches[7]) {
    if (matches[6]) {
      throw new SyntaxError(SYNTAX_ERROR_MESSAGE(source, offset));
    }
    value = convertInteger(
      10,
      matches[2]! as Sign,
      matches[7],
      STR_MAX_SAFE_INTEGER_DECIMAL,
      convertor,
      source,
      offset + matches[1]!.length
    );

  } else if (matches[3]) {
    assertSignEmpty(matches[2]! as Sign, source, offset);
    value = convertInteger(
      16,
      matches[2]! as Sign,
      matches[3].toLowerCase(),
      STR_MAX_SAFE_INTEGER_HEX,
      convertor,
      source,
      offset + matches[1]!.length
    );

  } else if (matches[4]) {
    assertSignEmpty(matches[2]! as Sign, source, offset);
    value = convertInteger(
      8,
      matches[2]! as Sign,
      matches[4],
      STR_MAX_SAFE_INTEGER_OCTAL,
      convertor,
      source,
      offset + matches[1]!.length
    );

  } else if (matches[5]) {
    assertSignEmpty(matches[2]! as Sign, source, offset);
    value = convertInteger(
      2,
      matches[2]! as Sign,
      matches[5],
      STR_MAX_SAFE_INTEGER_BINARY,
      convertor,
      source,
      offset + matches[1]!.length
    );
  }

  return {
    value,
    nextIndex: RE_INTEGER.lastIndex
  };
}

function convertInteger(
  radix: 10 | 16 | 8 | 2,
  sign: Sign,
  str: string,
  STR_MAX_SAFE_INTEGER: string,
  convertor: Convertor,
  source: Source,
  offset: number
): unknown {
  str = str.replace(/_/g, '');

  if (
    str.length < STR_MAX_SAFE_INTEGER.length
    || (
      str.length === STR_MAX_SAFE_INTEGER.length
      && str <= STR_MAX_SAFE_INTEGER
    )
  ) {
    return parseInt(`${sign}${str}`, radix);
  }

  try {
    return convertor.bigint(radix, sign, str);
  } catch (e) {
    if (e instanceof InvalidValueError) {
      e.message = PRETTY_ERROR_MESSAGE(e.message, source, offset);
    }
    throw e;
  }
}

function assertSignEmpty(sign: Sign, source: Source, offset: number): void {
  if (sign) {
    throw new SyntaxError(SYNTAX_ERROR_MESSAGE(source, offset));
  }
}
