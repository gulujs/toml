import {
  expect,
  describe,
  test
} from 'vitest';
import * as TOML from '../../src/index.js';

describe('SimpleModeSerializer', () => {
  test('best-day-ever', () => {
    const obj = {
      'best-day-ever': TOML.TomlDate.ofOffsetDateTime('1987-07-05T17:45:00Z'),
      numtheory: {
        boring: false,
        perfection: [6, 28, 496]
      }
    };

    const expected = `best-day-ever = 1987-07-05T17:45:00.000Z

[numtheory]
boring = false
perfection = [
  6,
  28,
  496
]`;

    expect(TOML.stringify(obj)).toBe(expected);
  });

  test('table/array-table-array', () => {
    const obj = {
      a: [
        {
          b: [
            {
              c: { d: 'val0' }
            },
            {
              c: { d: 'val1' }
            }
          ]
        }
      ]
    };

    const expected = `[[a]]

[[a.b]]

[a.b.c]
d = 'val0'

[[a.b]]

[a.b.c]
d = 'val1'`;
    expect(TOML.stringify(obj)).toBe(expected);
  });

  test('float/inf-and-nan', () => {
    const obj = {
      infinity: Number.POSITIVE_INFINITY,
      infinity_neg: Number.NEGATIVE_INFINITY,
      nan: Number.NaN
    };

    expect(TOML.stringify(obj)).toBe('infinity = inf\ninfinity_neg = -inf\nnan = nan');
  });
});
