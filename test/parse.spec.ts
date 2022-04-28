import * as fs from 'fs/promises';
import { readdirp } from '@lunjs/readdirp';
import { expect } from 'chai';
import * as TOML from '../src/index.js';
import {
  checkResult,
  invalidTomlTestsDir,
  validTomlTestsDir
} from './utils.js';


describe('TOML.parse', () => {
  describe('toml-test', () => {
    it('valid', async () => {
      const fileFilter = [
        '!*.json',

        // https://github.com/BurntSushi/toml-test/blob/e908fc3c48fe015d32c6a1cfbdc14e1d17706bf5/version.go#L13
        '!escape-esc.toml'
      ];
      for await (const file of readdirp(validTomlTestsDir, { fileFilter })) {
        const source = await fs.readFile(file.fullPath, { encoding: 'utf-8' });
        try {
          const result = TOML.parse(source);
          await checkResult(result, file.fullPath);
        } catch (e) {
          expect.fail(`
TOML: valid/${file.path}
Stack: ${(e as Error).stack}
`);
        }
      }
    });

    it('invalid', async () => {
      const fileFilter = [
        '!bad-utf8-in-comment.toml',
        '!bad-utf8-in-string.toml',

        '!hour-over.toml'
      ];

      for await (const file of readdirp(invalidTomlTestsDir, { fileFilter })) {
        const source = await fs.readFile(file.fullPath, { encoding: 'utf-8' });

        let err: unknown;
        try {
          TOML.parse(source);
        } catch (e) {
          err = e;
        }

        if (!err) {
          expect.fail(`
TOML: invalid/${file.path}
It should be an invalid toml file, but the parser does not throw an error.
`);
        }
      }
    });
  });

  describe('table comment', () => {
    it('basic', () => {
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
      const comment = TOML.getTableComment(result.foo);
      expect(comment).to.equal(' hello world');
    });

    it('multiple lines', () => {
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
      const comment = TOML.getTableComment(result.foo.bar);
      expect(comment).to.equal(' comment 2\n comment 3');
    });
  });
});
