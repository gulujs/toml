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
      for await (const file of readdirp(validTomlTestsDir, { fileFilter: '!*.json' })) {
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
          if ((e as Error).message === '1234') {
            err = null;
          }
        }

        if (!err) {
          expect.fail(file.path);
        }
      }
    });
  });
});
