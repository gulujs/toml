import { expect, describe, test } from 'vitest';
import { Source } from '../../../src/parser/source.js';
import { getInteger } from '../../../src/parser/types/integer.js';
import { Converters, ValueResult } from '../../../src/parser/types/get-value.js';
import { DatetimeConverter, FloatConverter, IntegerConverter } from '../../../src/index.js';

function parseInteger(str: string): ValueResult | null {
  const source = new Source(str);
  source.next();
  const converters: Converters = {
    integer: new IntegerConverter(),
    float: new FloatConverter(),
    datetime: new DatetimeConverter()
  };
  return getInteger(source, 0, converters);
}

describe('parser - Integer', () => {
  test('parse integer', () => {
    const r = parseInteger('42');
    expect(r).toBeTruthy();
    expect(r!.value).toBe(42);
  });

  test('parse negative integer', () => {
    const r = parseInteger('-42');
    expect(r).toBeTruthy();
    expect(r!.value).toBe(-42);
  });

  test('parse big integer', () => {
    const r = parseInteger('424242424242424242');
    expect(r).toBeTruthy();
    expect(r!.value).toBe(BigInt('424242424242424242'));
  });

  test('parse integer with underscores', () => {
    const r = parseInteger('4_2');
    expect(r).toBeTruthy();
    expect(r!.value).toBe(42);
  });

  test('parse hexadecimal', () => {
    const r = parseInteger('0xDEADBEEF');
    expect(r).toBeTruthy();
    expect(r!.value).toBe(0xDEADBEEF);
  });

  test('parse octal', () => {
    const r = parseInteger('0o01234567');
    expect(r).toBeTruthy();
    expect(r!.value).toBe(0o01234567);
  });

  test('parse binary', () => {
    const r = parseInteger('0b11010110');
    expect(r).toBeTruthy();
    expect(r!.value).toBe(0b11010110);
  });
});
