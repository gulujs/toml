import { expect, describe, test } from 'vitest';
import { Source } from '../../../src/parser/source.js';
import { Converters, ValueResult } from '../../../src/parser/types/get-value.js';
import { getInlineTable } from '../../../src/parser/types/inline-table.js';
import {
  DatetimeConverter,
  FloatConverter,
  IntegerConverter
} from '../../../src/index.js';

function parseInlineTable(str: string): ValueResult | null {
  const source = new Source(str);
  source.next();
  const converters: Converters = {
    integer: new IntegerConverter(),
    float: new FloatConverter(),
    datetime: new DatetimeConverter()
  };
  return getInlineTable(source, 0, converters);
}

describe('parser - Inline Table', () => {
  test('parse point', () => {
    const r = parseInlineTable('{ x = 1, y = 2 }');
    expect(r).toBeTruthy();
    expect(r!.value).toEqual({ x: 1, y: 2 });
  });
});
