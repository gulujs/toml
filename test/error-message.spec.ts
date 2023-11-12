import { expect, describe, test } from 'vitest';
import * as TOML from '../src/index.js';
import { readTomlTestFile } from './utils.js';

describe('Error message', () => {
  describe('types/array', () => {
    test('SyntaxError 1', async () => {
      const source = await readTomlTestFile('invalid/array/text-after-array-entries.toml');
      expect(() => TOML.parse(source)).toThrowError('Unexpected token in TOML at row 2, col 46');
    });

    test('SyntaxError 2', async () => {
      const source = 'a = [1,';
      expect(() => TOML.parse(source)).toThrowError('Unexpected token in TOML at row 1, col 8');
    });

    test('SyntaxError 3', async () => {
      const source = await readTomlTestFile('invalid/array/missing-separator.toml');
      expect(() => TOML.parse(source)).toThrowError('Unexpected token in TOML at row 1, col 12');
    });
  });

  describe('types/datetime', () => {
    test('InvalidValueError 1', async () => {
      const source = await readTomlTestFile('invalid/datetime/mday-over.toml');
      expect(() => TOML.parse(source)).toThrowError('Invalid datetime 2006-01-32T00:00:00-00:00 in TOML at row 3, col 5');
    });
  });

  describe('types/float', () => {
    test('SyntaxError 1', async () => {
      const source = await readTomlTestFile('invalid/float/float.multi');
      expect(() => TOML.parse(source)).toThrowError('Unexpected token in TOML at row 1, col 16');
    });
  });

  describe('types/inline-table', () => {
    test('SyntaxError 1', async () => {
      const source = 'a = { cb = }';
      expect(() => TOML.parse(source)).toThrowError('Unexpected token in TOML at row 1, col 12');
    });

    test('SyntaxError 2', async () => {
      const source = await readTomlTestFile('invalid/inline-table/double-comma.toml');
      expect(() => TOML.parse(source)).toThrowError('Unexpected token in TOML at row 1, col 10');
    });

    test('SyntaxError 3', async () => {
      const source = await readTomlTestFile('invalid/inline-table/linebreak-1.toml');
      expect(() => TOML.parse(source)).toThrowError('Unexpected token in TOML at row 3, col 17');
    });
  });

  describe('types/integer', () => {
    test('SyntaxError 1', async () => {
      const source = await readTomlTestFile('invalid/integer/integer.multi');
      expect(() => TOML.parse(source)).toThrowError('Unexpected token in TOML at row 1, col 18');
    });

    test('SyntaxError 2', async () => {
      const source = await readTomlTestFile('invalid/integer/negative-bin.toml');
      expect(() => TOML.parse(source)).toThrowError('Unexpected token in TOML at row 1, col 16');
    });
  });

  describe('types/string', () => {
    test('SyntaxError 1', async () => {
      const source = "a = '''";
      expect(() => TOML.parse(source)).toThrowError('Unexpected token in TOML at row 1, col 8');
    });

    test('SyntaxError 2', async () => {
      const source = "a = '''\n";
      expect(() => TOML.parse(source)).toThrowError('Unexpected token in TOML at row 2, col 1');
    });

    test('SyntaxError 3', async () => {
      const source = 'a = """';
      expect(() => TOML.parse(source)).toThrowError('Unexpected token in TOML at row 1, col 8');
    });

    test('SyntaxError 4', async () => {
      const source = await readTomlTestFile('invalid/string/multiline-no-close-2.toml');
      expect(() => TOML.parse(source)).toThrowError('Unexpected token in TOML at row 2, col 1');
    });
  });

  describe('util', () => {
    test('assertValidString', async () => {
      const source = await readTomlTestFile('invalid/control/comment-del.toml');
      expect(() => TOML.parse(source)).toThrowError('Invalid character 0x7f in TOML at row 1, col 24');
    });

    test('unescapeString', async () => {
      const source = await readTomlTestFile('invalid/string/bad-byte-escape.toml');
      expect(() => TOML.parse(source)).toThrowError('Invalid escape codes \\x in TOML at row 1, col 12');
    });
  });

  describe('table-object', () => {
    test('DUPLICATE_KEY_MESSAGE', async () => {
      const source = await readTomlTestFile('invalid/key/duplicate-keys.toml');
      expect(() => TOML.parse(source)).toThrowError('The key dupe is duplicated in global');
    });

    test('TABLE_NAME_IS_ALREADY_DECLARED_AS_NON_TABLE_MESSAGE 1', async () => {
      const source = await readTomlTestFile('invalid/inline-table/add.toml');
      expect(() => TOML.parse(source)).toThrowError('The key a is already declared as non-table type when define Table [a.b]');
    });

    test('TABLE_NAME_IS_ALREADY_DECLARED_AS_NON_TABLE_MESSAGE 1', async () => {
      const source = `
a = 1
[[a.c]]
`;
      expect(() => TOML.parse(source)).toThrowError('The key a is already declared as non-table type when define "Array of Tables" [[a.c]]');
    });

    test('DUPLICATE_TABLE_NAME_MESSAGE 1', async () => {
      const source = await readTomlTestFile('invalid/table/duplicate.toml');
      expect(() => TOML.parse(source)).toThrowError('The name of Table [a] is duplicated');
    });

    test('DUPLICATE_TABLE_NAME_MESSAGE 2', async () => {
      const source = await readTomlTestFile('invalid/table/duplicate-key-dotted-table.toml');
      expect(() => TOML.parse(source)).toThrowError('The name of Table [fruit.apple] is duplicated');
    });

    test('DUPLICATE_TABLE_NAME_MESSAGE 3', async () => {
      const source = await readTomlTestFile('invalid/table/duplicate-key-dotted-table2.toml');
      expect(() => TOML.parse(source)).toThrowError('The name of Table [fruit.apple.taste] is duplicated');
    });

    test('TABLE_NAME_IS_DECLARED_AS_ARRAY_OF_TABLES_MESSAGE', async () => {
      const source = await readTomlTestFile('invalid/table/duplicate-table-array2.toml');
      expect(() => TOML.parse(source)).toThrowError('The name of Table [tbl] is already declared as "Array of Tables"');
    });

    test('ARRAY_OF_TABLES_NAME_IS_DECLARED_AS_OTHER_TYPE_MESSAGE', async () => {
      const source = await readTomlTestFile('invalid/table/array-implicit.toml');
      expect(() => TOML.parse(source)).toThrowError('The name of "Array of Tables" [[albums]] is already declared as other type');
    });

    test('ARRAY_OF_TABLES_NAME_IS_DECLARED_AS_KEY_MESSAGE', async () => {
      const source = await readTomlTestFile('invalid/array/tables-1.toml');
      expect(() => TOML.parse(source)).toThrowError('The name of "Array of Tables" [[fruit]] is already declared as key');
    });

    test('KEY_IS_NOT_ALLOWED_TO_ADD_TO_TABLE_MESSAGE 1', async () => {
      const source = await readTomlTestFile('invalid/table/append-with-dotted-keys-1.toml');
      expect(() => TOML.parse(source)).toThrowError('The key b.c.t in Table [a] to add to [a.b.c] after explicitly defining it above is not allowed');
    });

    test('KEY_IS_NOT_ALLOWED_TO_ADD_TO_TABLE_MESSAGE 2', async () => {
      const source = await readTomlTestFile('invalid/table/append-to-array-with-dotted-keys.toml');
      expect(() => TOML.parse(source)).toThrowError('The key b.y in Table [a] to add to [[a.b]] after explicitly defining it above is not allowed');
    });

    test('FAILED_TO_ACCESS_AS_TABLE_MESSAGE', async () => {
      const source = await readTomlTestFile('invalid/key/dotted-redefine-table.toml');
      expect(() => TOML.parse(source)).toThrowError('When define key a.b.c in global, that failed to access a.b as table');
    });

    test('CANNOT_EXTEND_TABLES_WITHIN_STATIC_ARRAYS_MESSAGE', async () => {
      const source = await readTomlTestFile('invalid/array/extending-table.toml');
      expect(() => TOML.parse(source)).toThrowError('Cannot extend Table [a.c] within static arrays a');
    });
  });
});
