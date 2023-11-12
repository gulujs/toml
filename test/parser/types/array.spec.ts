import { expect, describe, test } from 'vitest';
import { Source } from '../../../src/parser/source.js';
import { Converters, ValueResult } from '../../../src/parser/types/get-value.js';
import { getArray } from '../../../src/parser/types/array.js';
import {
  DatetimeConverter,
  FloatConverter,
  IntegerConverter
} from '../../../src/index.js';

function parseArray(str: string): ValueResult | null {
  const source = new Source(str);
  source.next();
  const converters: Converters = {
    integer: new IntegerConverter(),
    float: new FloatConverter(),
    datetime: new DatetimeConverter()
  };
  return getArray(source, 0, converters);
}

describe('parser - Array', () => {
  test('parse simple array', () => {
    const r = parseArray('[ 1, 2, 3 ]');
    expect(r).toBeTruthy();
    expect(r!.value).toEqual([1, 2, 3]);
  });
});
