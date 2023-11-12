import { Source } from '../source.js';
import { getBoolean } from './boolean.js';
import { getDatetime } from './datetime.js';
import { getFloat } from './float.js';
import { getInteger } from './integer.js';
import { getString } from './string.js';
import { getInlineTable } from './inline-table.js';
import { getArray } from './array.js';
import { Converter } from '../../converter/index.js';


export interface Converters {
  integer: Converter<unknown>;
  float: Converter<unknown>;
  datetime: Converter<unknown>;
}

export interface ValueResult {
  value: unknown;
  nextIndex: number;
}

const valueGetters = [
  getBoolean,
  getDatetime,
  getFloat,
  getInteger,
  getString,
  getInlineTable,
  getArray
];

export function tryGetValue(source: Source, offset: number, converters: Converters): ValueResult | null {
  for (const getValue of valueGetters) {
    const value = getValue(source, offset, converters);
    if (value !== null) {
      return value;
    }
  }
  return null;
}
