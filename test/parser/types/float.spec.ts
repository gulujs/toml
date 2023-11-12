import { expect, describe, test } from 'vitest';
import { Source } from '../../../src/parser/source.js';
import { Converters, ValueResult } from '../../../src/parser/types/get-value.js';
import { DatetimeConverter, FloatConverter, IntegerConverter } from '../../../src/index.js';
import { getFloat } from '../../../src/parser/types/float.js';

function parseFloat(str: string): ValueResult | null {
  const source = new Source(str);
  source.next();
  const converters: Converters = {
    integer: new IntegerConverter(),
    float: new FloatConverter(),
    datetime: new DatetimeConverter()
  };
  return getFloat(source, 0, converters);
}

describe('parser - Float', () => {
  test('parse float', () => {
    const r = parseFloat('4.2');
    expect(r).toBeTruthy();
    expect(r!.value).toBe(4.2);
  });

  test('parse negative float', () => {
    const r = parseFloat('-4.2');
    expect(r).toBeTruthy();
    expect(r!.value).toBe(-4.2);
  });

  test('parse exponent', () => {
    const r = parseFloat('5e+22');
    expect(r).toBeTruthy();
    expect(r!.value).toBe(5e+22);
  });

  test('parse float with underscores', () => {
    const r = parseFloat('224_617.445_991_228');
    expect(r).toBeTruthy();
    expect(r!.value).toBe(224_617.445_991_228);
  });

  test('parse infinity', () => {
    let r = parseFloat('inf');
    expect(r).toBeTruthy();
    expect(r!.value).toBe(Number.POSITIVE_INFINITY);

    r = parseFloat('+inf');
    expect(r).toBeTruthy();
    expect(r!.value).toBe(Number.POSITIVE_INFINITY);

    r = parseFloat('-inf');
    expect(r).toBeTruthy();
    expect(r!.value).toBe(Number.NEGATIVE_INFINITY);
  });

  test('parse not a number', () => {
    let r = parseFloat('nan');
    expect(r).toBeTruthy();
    expect(r!.value).toBe(Number.NaN);

    r = parseFloat('+nan');
    expect(r).toBeTruthy();
    expect(r!.value).toBe(Number.NaN);

    r = parseFloat('-nan');
    expect(r).toBeTruthy();
    expect(r!.value).toBe(Number.NaN);
  });
});
