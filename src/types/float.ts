import { RE_FLOAT } from '../constants.js';
import { SYNTAX_ERROR_MESSAGE } from '../errors/index.js';
import { ValueResult } from '../interfaces.js';
import { Source } from '../source.js';


export function getFloat(source: Source, offset: number): ValueResult | null {
  RE_FLOAT.lastIndex = offset;
  const matches = RE_FLOAT.exec(source.line);
  if (!matches || matches.index !== offset) {
    return null;
  }

  let value!: number;
  if (matches[2]) {
    if (matches[3]) {
      throw new SyntaxError(SYNTAX_ERROR_MESSAGE(source, offset + matches[1]!.length));
    }

    value = parseFloat(matches[2].replace(/_/g, ''));

  } else if (matches[4]) {
    if (matches[4] === 'inf' || matches[4] === '+inf') {
      value = Number.POSITIVE_INFINITY;
    } else {
      value = Number.NEGATIVE_INFINITY;
    }

  } else if (matches[5]) {
    value = Number.NaN;
  }

  return {
    value,
    nextIndex: RE_FLOAT.lastIndex
  };
}
