import {
  expect,
  describe,
  test
} from 'vitest';
import * as fs from 'fs/promises';
import { readdirp } from '@gulujs/readdirp';
import * as TOML from '../src/index.js';
import {
  checkResult,
  invalidTomlTestsDir,
  validTomlTestsDir,
  createIncludesFileFilter
} from './utils.js';


describe('toml-test', () => {
  test('valid', async () => {
    const fileFilter = await createIncludesFileFilter();

    for await (const file of readdirp(validTomlTestsDir, { fileFilter, filterEntryKey: 'fullPath' })) {
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

  test('invalid', async () => {
    const fileFilter = await createIncludesFileFilter();

    for await (const file of readdirp(invalidTomlTestsDir, { fileFilter, filterEntryKey: 'fullPath' })) {
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
