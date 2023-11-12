import {
  expect,
  describe,
  test
} from 'vitest';
import * as TOML from '../../src/index.js';

describe('SchemaModeSerializer', () => {
  describe('types', () => {
    test('Any', () => {
      const schemata: TOML.Schema[] = [
        {
          key: 'a',
          type: TOML.SchemaType.Any
        }
      ];

      expect(TOML.stringify({}, { schemata })).toBe('');
      expect(TOML.stringify({ b: 1 }, { schemata })).toBe('');
      expect(TOML.stringify({ a: true }, { schemata })).toBe('a = true');
      expect(TOML.stringify({ a: 1 }, { schemata })).toBe('a = 1');
      expect(TOML.stringify({ a: 1.1 }, { schemata })).toBe('a = 1.1');
      expect(TOML.stringify({ a: 'z' }, { schemata })).toBe("a = 'z'");
      expect(TOML.stringify({ a: TOML.TomlDate.ofLocalDate('2023-09-23') }, { schemata })).toBe('a = 2023-09-23');
      expect(TOML.stringify({ a: { b: 1 } }, { schemata })).toBe('a = { b = 1 }');
      expect(TOML.stringify({ a: [1, 2, 3] }, { schemata })).toBe('a = [\n  1,\n  2,\n  3\n]');
      expect(TOML.stringify({ a: [{ b: 1 }, { b: 2 }] }, { schemata })).toBe('a = [\n  { b = 1 },\n  { b = 2 }\n]');
    });

    test('Boolean', () => {
      const schemata: TOML.Schema[] = [
        {
          key: 'a',
          type: TOML.SchemaType.Boolean
        }
      ];

      expect(TOML.stringify({}, { schemata })).toBe('');
      expect(TOML.stringify({ a: true }, { schemata })).toBe('a = true');
      expect(() => TOML.stringify({ a: 1 }, { schemata })).toThrowError('`a` is not a boolean');
    });

    test('Integer', () => {
      const schemata: TOML.Schema[] = [
        {
          key: 'a',
          type: TOML.SchemaType.Integer
        }
      ];

      expect(TOML.stringify({}, { schemata })).toBe('');
      expect(TOML.stringify({ a: 1 }, { schemata })).toBe('a = 1');
      expect(() => TOML.stringify({ a: 1.1 }, { schemata })).toThrowError('`a` is not an integer');
    });

    test('Float', () => {
      const schemata: TOML.Schema[] = [
        {
          key: 'a',
          type: TOML.SchemaType.Float
        }
      ];

      expect(TOML.stringify({}, { schemata })).toBe('');
      expect(TOML.stringify({ a: 1.1 }, { schemata })).toBe('a = 1.1');
      expect(() => TOML.stringify({ a: 1 }, { schemata })).toThrowError('`a` is not a float');
    });

    test('DateTime', () => {
      const schemata: TOML.Schema[] = [
        {
          key: 'a',
          type: TOML.SchemaType.DateTime
        }
      ];

      const date = TOML.TomlDate.ofLocalDate('2023-09-23');

      expect(TOML.stringify({}, { schemata })).toBe('');
      expect(TOML.stringify({ a: date }, { schemata })).toBe('a = 2023-09-23');
      expect(() => TOML.stringify({ a: 1 }, { schemata })).toThrowError('`a` is not a datetime');
    });

    test('String', () => {
      const schemata: TOML.Schema[] = [
        {
          key: 'a',
          type: TOML.SchemaType.String
        }
      ];

      expect(TOML.stringify({}, { schemata })).toBe('');
      expect(TOML.stringify({ a: 'z' }, { schemata })).toBe("a = 'z'");
      expect(() => TOML.stringify({ a: 1 }, { schemata })).toThrowError('`a` is not a string');
    });

    test('InlineTable', () => {
      const schemata: TOML.Schema[] = [
        {
          key: 'a',
          type: TOML.SchemaType.InlineTable,
          items: [
            {
              key: 'b',
              type: TOML.SchemaType.Integer
            },
            {
              key: 'c',
              type: TOML.SchemaType.String
            }
          ]
        }
      ];

      expect(TOML.stringify({}, { schemata })).toBe('');
      expect(TOML.stringify({ a: { b: 1, c: 'z', d: 3 } }, { schemata })).toBe("a = { b = 1, c = 'z' }");
      expect(() => TOML.stringify({ a: 1 }, { schemata })).toThrowError('`a` is not an object');
    });

    test('Table', () => {
      const schemata: TOML.Schema[] = [
        {
          key: 'a',
          type: TOML.SchemaType.Table,
          items: [
            {
              key: 'b',
              type: TOML.SchemaType.Integer
            },
            {
              key: 'c',
              type: TOML.SchemaType.String
            }
          ]
        }
      ];

      expect(TOML.stringify({}, { schemata })).toBe('');
      expect(TOML.stringify({ a: { b: 1, c: 'z', d: 3 } }, { schemata })).toBe("[a]\nb = 1\nc = 'z'");
      expect(() => TOML.stringify({ a: 1 }, { schemata })).toThrowError('`a` is not an object');
    });

    test('Array', () => {
      const schemata: TOML.Schema[] = [
        {
          key: 'a',
          type: TOML.SchemaType.Array,
          items: TOML.SchemaType.Integer
        }
      ];

      expect(TOML.stringify({}, { schemata })).toBe('');
      expect(TOML.stringify({ a: [1, 2, 3] }, { schemata })).toBe('a = [\n  1,\n  2,\n  3\n]');
      expect(() => TOML.stringify({ a: [1, 2, 'a'] }, { schemata })).toThrowError('`a[2]` is not an integer');
      expect(() => TOML.stringify({ a: 1 }, { schemata })).toThrowError('`a` is not an array');
    });

    test('ArrayOfTables', () => {
      const schemata: TOML.Schema[] = [
        {
          key: 'a',
          type: TOML.SchemaType.ArrayOfTables,
          items: [
            {
              key: 'b',
              type: TOML.SchemaType.Integer
            }
          ]
        }
      ];

      expect(TOML.stringify({}, { schemata })).toBe('');
      expect(TOML.stringify({ a: [{ b: 1 }, { b: 2 }] }, { schemata })).toBe('[[a]]\nb = 1\n\n[[a]]\nb = 2\n');
      expect(() => TOML.stringify({ a: [{ b: 1 }, { b: 'z' }] }, { schemata })).toThrowError('`a[1].b` is not an integer');
      expect(() => TOML.stringify({ a: {} }, { schemata })).toThrowError('`a` is not an array');
    });
  });

  describe('options', () => {
    describe('strict', () => {
      test('Any', () => {
        const schemata: TOML.Schema[] = [
          {
            key: 'a',
            type: TOML.SchemaType.Any
          }
        ];

        expect(TOML.stringify({}, { schemata, strict: true })).toBe('');
      });

      test('Boolean', () => {
        const schemata: TOML.Schema[] = [
          {
            key: 'a',
            type: TOML.SchemaType.Boolean
          }
        ];

        expect(() => TOML.stringify({}, { schemata, strict: true })).toThrowError('`a` is not a boolean');
      });

      test('Integer', () => {
        const schemata: TOML.Schema[] = [
          {
            key: 'a',
            type: TOML.SchemaType.Integer
          }
        ];

        expect(() => TOML.stringify({}, { schemata, strict: true })).toThrowError('`a` is not an integer');
      });

      test('Float', () => {
        const schemata: TOML.Schema[] = [
          {
            key: 'a',
            type: TOML.SchemaType.Float
          }
        ];

        expect(() => TOML.stringify({}, { schemata, strict: true })).toThrowError('`a` is not a float');
      });

      test('DateTime', () => {
        const schemata: TOML.Schema[] = [
          {
            key: 'a',
            type: TOML.SchemaType.DateTime
          }
        ];

        expect(() => TOML.stringify({}, { schemata, strict: true })).toThrowError('`a` is not a datetime');
      });

      test('String', () => {
        const schemata: TOML.Schema[] = [
          {
            key: 'a',
            type: TOML.SchemaType.String
          }
        ];

        expect(() => TOML.stringify({}, { schemata, strict: true })).toThrowError('`a` is not a string');
      });

      test('InlineTable', () => {
        const schemata: TOML.Schema[] = [
          {
            key: 'a',
            type: TOML.SchemaType.InlineTable,
            items: [
              {
                key: 'b',
                type: TOML.SchemaType.Integer
              },
              {
                key: 'c',
                type: TOML.SchemaType.String
              }
            ]
          }
        ];

        expect(() => TOML.stringify({}, { schemata, strict: true })).toThrowError('`a` is not an object');
        expect(() => TOML.stringify({ a: {} }, { schemata, strict: true })).toThrowError('`a.b` is not an integer');
      });

      test('Table', () => {
        const schemata: TOML.Schema[] = [
          {
            key: 'a',
            type: TOML.SchemaType.Table,
            items: [
              {
                key: 'b',
                type: TOML.SchemaType.Integer
              },
              {
                key: 'c',
                type: TOML.SchemaType.String
              }
            ]
          }
        ];

        expect(() => TOML.stringify({}, { schemata, strict: true })).toThrowError('`a` is not an object');
        expect(() => TOML.stringify({ a: {} }, { schemata, strict: true })).toThrowError('`a.b` is not an integer');
      });

      test('Array', () => {
        const schemata: TOML.Schema[] = [
          {
            key: 'a',
            type: TOML.SchemaType.Array,
            items: TOML.SchemaType.Integer
          }
        ];

        expect(() => TOML.stringify({}, { schemata, strict: true })).toThrowError('`a` is not an array');
        expect(TOML.stringify({ a: [] }, { schemata, strict: true })).toBe('a = [\n  \n]');
        expect(() => TOML.stringify({ a: [null] }, { schemata, strict: false })).toThrowError('`a[0]` is not an integer');
        expect(() => TOML.stringify({ a: [null] }, { schemata, strict: true })).toThrowError('`a[0]` is not an integer');
      });

      test('ArrayOfTables', () => {
        const schemata: TOML.Schema[] = [
          {
            key: 'a',
            type: TOML.SchemaType.ArrayOfTables,
            items: [
              {
                key: 'b',
                type: TOML.SchemaType.Integer
              }
            ]
          }
        ];

        expect(() => TOML.stringify({}, { schemata, strict: true })).toThrowError('`a` is not an array');
        expect(TOML.stringify({ a: [] }, { schemata, strict: true })).toBe('');
        expect(() => TOML.stringify({ a: [null] }, { schemata, strict: false })).toThrowError('`a` is not an object');
        expect(() => TOML.stringify({ a: [null] }, { schemata, strict: true })).toThrowError('`a` is not an object');
        expect(() => TOML.stringify({ a: [{}] }, { schemata, strict: true })).toThrowError('`a[0].b` is not an integer');
      });
    });
  });
});
