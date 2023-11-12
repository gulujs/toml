import { expect, describe, test } from 'vitest';
import { Source } from '../../../src/parser/source.js';
import { ValueResult } from '../../../src/parser/types/get-value.js';
import { getString } from '../../../src/parser/types/string.js';

function parseString(str: string): ValueResult | null {
  const source = new Source(str);
  source.next();
  return getString(source, 0);
}

describe('parser - String', () => {
  test('parse single quote string', () => {
    const r = parseString("'Hello world!'");
    expect(r).toBeTruthy();
    expect(r!.value).toBe('Hello world!');
  });

  test('parse double quote string', () => {
    const r = parseString('"Hello world!"');
    expect(r).toBeTruthy();
    expect(r!.value).toBe('Hello world!');
  });
});
