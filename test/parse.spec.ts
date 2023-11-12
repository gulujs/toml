import {
  expect,
  describe,
  test
} from 'vitest';
import * as TOML from '../src/index.js';
import { readTomlTestFile } from './utils.js';


describe('TOML.parse', () => {
  describe('table comment', () => {
    test('basic', () => {
      const source = `
# hello world
[foo]
bar = 4
`;
      interface Result {
        foo: {
          bar: number;
        };
      }

      const result = TOML.parse<Result>(source, { enableTableComment: true });
      const comment = TOML.TableComment.getComment(result.foo);
      expect(comment).toBe(' hello world');
    });

    test('multiple lines', () => {
      const source = `
a = 1
# comment 1

# comment 2
# comment 3
[foo.bar]
b = 2
`;
      interface Result {
        a: number;
        foo: {
          bar: { b: number; };
        };
      }

      const result = TOML.parse<Result>(source, { enableTableComment: true });
      const comment = TOML.TableComment.getComment(result.foo.bar);
      expect(comment).toBe(' comment 2\n comment 3');
    });
  });

  test('table and array table', () => {
    const source = `
[a]
[[a.b]]
[[a.b]]
[a.b.c]
`;
    expect(TOML.parse(source)).toEqual({
      a: {
        b: [
          {},
          { c: {} }
        ]
      }
    });
  });

  test('valid/spec/table-9', async () => {
    const source = await readTomlTestFile('valid/spec/table-9.toml');
    expect(TOML.parse(source)).toEqual({
      fruit: {
        apple: {
          color: 'red',
          taste: { sweet: true },
          texture: { smooth: true }
        }
      }
    });
  });
});
