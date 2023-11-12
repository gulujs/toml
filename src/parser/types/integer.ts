import { RE_INTEGER } from '../constants.js';
import { PRETTY_ERROR_MESSAGE, SYNTAX_ERROR_MESSAGE } from '../../errors/index.js';
import { Source } from '../source.js';
import { Converters, ValueResult } from './get-value.js';
import { Radix, Sign } from '../../converter/index.js';


export function getInteger(source: Source, offset: number, converters: Converters): ValueResult | null {
  RE_INTEGER.lastIndex = offset;
  const matches = RE_INTEGER.exec(source.line);
  if (!matches || matches.index !== offset) {
    return null;
  }

  let value!: number | bigint | unknown;
  if (matches[7]) {
    if (matches[6]) {
      throw new SyntaxError(SYNTAX_ERROR_MESSAGE(source, offset));
    }
    value = convertInteger(
      10,
      matches[2]! as Sign,
      matches[7],
      converters,
      source,
      offset + matches[1]!.length
    );

  } else if (matches[3]) {
    assertSignEmpty(matches[2]! as Sign, source, offset);
    value = convertInteger(
      16,
      matches[2]! as Sign,
      matches[3].toLowerCase(),
      converters,
      source,
      offset + matches[1]!.length
    );

  } else if (matches[4]) {
    assertSignEmpty(matches[2]! as Sign, source, offset);
    value = convertInteger(
      8,
      matches[2]! as Sign,
      matches[4],
      converters,
      source,
      offset + matches[1]!.length
    );

  } else if (matches[5]) {
    assertSignEmpty(matches[2]! as Sign, source, offset);
    value = convertInteger(
      2,
      matches[2]! as Sign,
      matches[5],
      converters,
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
  radix: Radix,
  sign: Sign,
  str: string,
  converters: Converters,
  source: Source,
  offset: number
): unknown {
  try {
    return converters.integer.convertStringToJsValue(str.replace(/_/g, ''), { sign, radix });
  } catch (e) {
    if (e instanceof Error) {
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
