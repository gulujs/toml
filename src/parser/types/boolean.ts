import { RE_BOOLEAN } from '../constants.js';
import { ValueResult } from './get-value.js';
import { Source } from '../source.js';


export function getBoolean(source: Source, offset: number): ValueResult | null {
  RE_BOOLEAN.lastIndex = offset;
  const matches = RE_BOOLEAN.exec(source.line);
  if (!matches || matches.index !== offset) {
    return null;
  }

  return {
    value: matches[1] === 'true',
    nextIndex: RE_BOOLEAN.lastIndex
  };
}
