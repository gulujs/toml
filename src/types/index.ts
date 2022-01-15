import { Source } from '../source.js';
import { getBoolean } from './boolean.js';
import { getDatetime } from './datetime.js';
import { getFloat } from './float.js';
import { getInteger } from './integer.js';
import { getString } from './string.js';
import { getInlineTable } from './inline-table.js';
import { getArray } from './array.js';
import { Convertor, ValueResult } from '../interfaces.js';


const valueGetters = [
  getBoolean,
  getDatetime,
  getFloat,
  getInteger,
  getString,
  getInlineTable,
  getArray
];

export function tryGetValue(source: Source, offset: number, convertor: Convertor): ValueResult | null {
  for (const getValue of valueGetters) {
    const value = getValue(source, offset, convertor);
    if (value !== null) {
      return value;
    }
  }
  return null;
}
