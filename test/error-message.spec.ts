import { expect } from 'chai';
import * as TOML from '../src/index.js';
import { readTomlTestFile } from './utils.js';

describe('Error message', () => {
  describe('types/array', () => {
    it('SyntaxError 1', async () => {
      const source = await readTomlTestFile('invalid/array/text-after-array-entries.toml');
      expect(() => TOML.parse(source)).to.throw('Unexpected token in TOML at row 2, col 46');
    });

    it('SyntaxError 2', async () => {
      const source = 'a = [1,';
      expect(() => TOML.parse(source)).to.throw('Unexpected token in TOML at row 1, col 8');
    });

    it('SyntaxError 5', async () => {
      const source = await readTomlTestFile('invalid/array/missing-separator.toml');
      expect(() => TOML.parse(source)).to.throw('Unexpected token in TOML at row 1, col 12');
    });
  });

  describe('types/datetime', () => {
    it('InvalidValueError 1', async () => {
      const source = await readTomlTestFile('invalid/datetime/mday-over.toml');
      expect(() => TOML.parse(source)).to.throw('Invalid datetime 2006-01-32T00:00:00-00:00 in TOML at row 3, col 5');
    });
  });

  describe('types/float', () => {
    it('SyntaxError 1', async () => {
      const source = await readTomlTestFile('invalid/float/float.multi');
      expect(() => TOML.parse(source)).to.throw('Unexpected token in TOML at row 1, col 16');
    });
  });

  describe('types/inline-table', () => {
    it('SyntaxError 1', async () => {
      const source = 'a = { cb = }';
      expect(() => TOML.parse(source)).to.throw('Unexpected token in TOML at row 1, col 12');
    });

    it('SyntaxError 2', async () => {
      const source = await readTomlTestFile('invalid/inline-table/double-comma.toml');
      expect(() => TOML.parse(source)).to.throw('Unexpected token in TOML at row 1, col 10');
    });

    it('SyntaxError 3', async () => {
      const source = await readTomlTestFile('invalid/inline-table/linebreak-1.toml');
      expect(() => TOML.parse(source)).to.throw('Unexpected token in TOML at row 3, col 17');
    });
  });

  describe('types/integer', () => {
    it('SyntaxError 1', async () => {
      const source = await readTomlTestFile('invalid/integer/integer.multi');
      expect(() => TOML.parse(source)).to.throw('Unexpected token in TOML at row 1, col 18');
    });

    it('SyntaxError 2', async () => {
      const source = await readTomlTestFile('invalid/integer/negative-bin.toml');
      expect(() => TOML.parse(source)).to.throw('Unexpected token in TOML at row 1, col 16');
    });
  });

  describe('types/string', () => {
    it('SyntaxError 1', async () => {
      const source = "a = '''";
      expect(() => TOML.parse(source)).to.throw('Unexpected token in TOML at row 1, col 8');
    });

    it('SyntaxError 2', async () => {
      const source = "a = '''\n";
      expect(() => TOML.parse(source)).to.throw('Unexpected token in TOML at row 2, col 1');
    });

    it('SyntaxError 3', async () => {
      const source = 'a = """';
      expect(() => TOML.parse(source)).to.throw('Unexpected token in TOML at row 1, col 8');
    });

    it('SyntaxError 5', async () => {
      const source = await readTomlTestFile('invalid/string/multiline-no-close-2.toml');
      expect(() => TOML.parse(source)).to.throw('Unexpected token in TOML at row 2, col 1');
    });
  });

  describe('util', () => {
    it('assertValidString', async () => {
      const source = await readTomlTestFile('invalid/control/comment-del.toml');
      expect(() => TOML.parse(source)).to.throw('Invalid character 0x7f in TOML at row 1, col 24');
    });

    it('unescapeString', async () => {
      const source = await readTomlTestFile('invalid/string/bad-byte-escape.toml');
      expect(() => TOML.parse(source)).to.throw('Invalid escape codes \\x in TOML at row 1, col 12');
    });
  });

  describe('table-object', () => {
    it('DUPLICATE_KEY_MESSAGE', async () => {
      const source = await readTomlTestFile('invalid/key/duplicate-keys.toml');
      expect(() => TOML.parse(source)).to.throw('The key dupe is duplicated in global');
    });

    it('TABLE_NAME_IS_DECLARED_AS_KEY_MESSAGE', async () => {
      const source = await readTomlTestFile('invalid/table/duplicate-key-dotted-table.toml');
      expect(() => TOML.parse(source)).to.throw('The name of table [fruit.apple] is already declared as key');
    });

    it('DUPLICATE_TABLE_NAME_MESSAGE', async () => {
      const source = await readTomlTestFile('invalid/table/duplicate.toml');
      expect(() => TOML.parse(source)).to.throw('The name of table [a] is duplicated');
    });

    it('TABLE_NAME_IS_DECLARED_AS_TABLE_ARRAY_MESSAGE', async () => {
      const source = await readTomlTestFile('invalid/table/duplicate-table-array2.toml');
      expect(() => TOML.parse(source)).to.throw('The name of table [tbl] is already declared as table array');
    });

    it('TABLE_ARRAY_NAME_IS_DECLARED_AS_OTHER_TYPE_MESSAGE', async () => {
      const source = await readTomlTestFile('invalid/table/array-implicit.toml');
      expect(() => TOML.parse(source)).to.throw('The name of table array [[albums]] is already declared as other type');
    });

    it('TABLE_ARRAY_NAME_IS_DECLARED_AS_KEY_MESSAGE', async () => {
      const source = await readTomlTestFile('invalid/array/tables-1.toml');
      expect(() => TOML.parse(source)).to.throw('The name of table array [[fruit]] is already declared as key');
    });

    it('KEY_IS_NOT_ALLOWED_TO_ADD_TO_TABLE_MESSAGE', async () => {
      const source = await readTomlTestFile('invalid/table/append-with-dotted-keys-1.toml');
      expect(() => TOML.parse(source)).to.throw('The key b.c.t in table [a] to add to [a.b.c] after explicitly defining it above is not allowed');
    });

    it('TABLE_NAME_IS_DECLARED_AS_KEY_MESSAGE 2', async () => {
      const source = await readTomlTestFile('invalid/table/duplicate-key-dotted-table2.toml');
      expect(() => TOML.parse(source)).to.throw('The name of table [fruit.apple.taste] is already declared as key');
    });

    it('FAILED_TO_ACCESS_AS_TABLE_MESSAGE', async () => {
      const source = await readTomlTestFile('invalid/key/dotted-redefine-table.toml');
      expect(() => TOML.parse(source)).to.throw('When define key a.b.c in global, that failed to access a.b as table');
    });
  });
});
