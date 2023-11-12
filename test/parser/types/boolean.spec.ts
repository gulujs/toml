import { expect, describe, test } from 'vitest';
import { getBoolean } from '../../../src/parser/types/boolean.js';
import { Source } from '../../../src/parser/source.js';
import { ValueResult } from '../../../src/parser/types/get-value.js';

function parseBoolean(str: string): ValueResult | null {
  const source = new Source(str);
  source.next();
  return getBoolean(source, 0);
}

describe('parser - Boolean', () => {
  test('parse true', () => {
    const r = parseBoolean('true');
    expect(r).toBeTruthy();
    expect(r!.value).toBe(true);
  });
});
