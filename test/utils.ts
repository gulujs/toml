import * as Path from 'path';
import * as fs from 'fs/promises';
import { fileURLToPath } from 'url';
import * as TOML from '../src/index.js';


const __dirname = Path.dirname(fileURLToPath(import.meta.url));
const tomlTestsBaseDir = Path.join(__dirname, './toml-test/tests/');
const supportedTestFileListFilePath = Path.join(tomlTestsBaseDir, `files-toml-${TOML.version}`);

export const validTomlTestsDir = Path.join(tomlTestsBaseDir, 'valid/');
export const invalidTomlTestsDir = Path.join(tomlTestsBaseDir, 'invalid/');

export async function createIncludesFileFilter(): Promise<string[]> {
  const supportedTestFileListTxt = await fs.readFile(supportedTestFileListFilePath, { encoding: 'utf-8' });
  return supportedTestFileListTxt.split('\n')
    .filter(file => file.endsWith('toml'))
    .map(file => `**/${file}`);
}

export async function readTomlTestFile(file: string): Promise<string> {
  return fs.readFile(Path.join(__dirname, 'toml-test/tests', file), { encoding: 'utf-8' });
}

export async function checkResult(value: Record<string, unknown>, filepath: string): Promise<void> {
  const jsonPath = filepath.replace(/\.toml$/, '.json');
  const jsonStr = await fs.readFile(jsonPath, { encoding: 'utf-8' });
  const json = JSON.parse(jsonStr) as Record<string, unknown>;

  checkValue(json, value);
}

interface ExpectedValue {
  type: string;
  value: string;
}

function checkValue(expected: Record<string, unknown>, actual: Record<string, unknown>): void {
  for (const key of Object.keys(expected)) {
    const expectedValue = expected[key];
    const actualValue = actual[key];

    if (expectedValue && typeof expectedValue === 'object') {
      if (
        (expectedValue as ExpectedValue).type
        && typeof (expectedValue as ExpectedValue).value !== 'undefined'
      ) {
        assertValue(expectedValue as ExpectedValue, actualValue);
        continue;
      }

      checkValue(
        expectedValue as Record<string, unknown>,
        actualValue as Record<string, unknown>
      );
      continue;
    }

    if (
      Array.isArray(expectedValue)
      && Array.isArray(actualValue)
      && expectedValue.length === actualValue.length
    ) {
      for (let i = 0; i < actualValue.length; i++) {
        checkValue(
          expectedValue[i] as Record<string, unknown>,
          actualValue[i] as Record<string, unknown>
        );
      }
      continue;
    }

    throw new Error(`
expected:
${JSON.stringify(expectedValue, null, 4)}

actual:
${JSON.stringify(actualValue, null, 4)}
`);
  }
}

function UNEXPECTED_ERROR_MESSAGE(type: string, expected: unknown, actual: unknown): string {
  return `${type}:
expected:
${JSON.stringify(expected, null, 4)}

actual:
${JSON.stringify(actual, (_key: string, value: unknown): unknown => {
    if (typeof value === 'bigint') {
      return String(value);
    }
    return value;
  }, 4)}
`;
}

// eslint-disable-next-line complexity
function assertValue(expected: ExpectedValue, actual: unknown): void {
  if (expected.type === 'bool') {
    if (
      typeof actual === 'boolean'
      && expected.value === String(actual)
    ) {
      return;
    }
    throw new Error(UNEXPECTED_ERROR_MESSAGE(expected.type, expected, actual));
  }

  if (expected.type === 'string') {
    if (
      typeof actual === 'string'
      && expected.value === actual
    ) {
      return;
    }
    throw new Error(UNEXPECTED_ERROR_MESSAGE(expected.type, expected, actual));
  }

  if (expected.type === 'integer') {
    if (typeof actual === 'number') {
      if (Number(expected.value) === actual) {
        return;
      }
    } else if (typeof actual === 'bigint') {
      if (BigInt(expected.value) === actual) {
        return;
      }
    }
    throw new Error(UNEXPECTED_ERROR_MESSAGE(expected.type, expected, actual));
  }

  if (expected.type === 'float') {
    switch (expected.value) {
      case 'inf':
      case 'Inf':
      case '+inf':
      case '+Inf':
        if (actual === Number.POSITIVE_INFINITY) {
          return;
        }
        break;
      case '-inf':
      case '-Inf':
        if (actual === Number.NEGATIVE_INFINITY) {
          return;
        }
        break;
      case 'nan':
        if (Number.isNaN(actual)) {
          return;
        }
        break;
      default:
        if (
          typeof actual === 'number'
          && parseFloat(expected.value) === actual
        ) {
          return;
        }
    }

    throw new Error(UNEXPECTED_ERROR_MESSAGE(expected.type, expected, actual));
  }

  if (expected.type === 'datetime') {
    if (TOML.TomlDate.ofOffsetDateTime(expected.value).toString() === (actual as TOML.TomlDate).toString()) {
      return;
    }
    throw new Error(UNEXPECTED_ERROR_MESSAGE(expected.type, expected, actual));
  }

  if (expected.type === 'datetime-local') {
    if (TOML.TomlDate.ofLocalDateTime(expected.value).toString() === (actual as TOML.TomlDate).toString()) {
      return;
    }
    throw new Error(UNEXPECTED_ERROR_MESSAGE(expected.type, expected, actual));
  }

  if (expected.type === 'date-local') {
    if (TOML.TomlDate.ofLocalDate(expected.value).toString() === (actual as TOML.TomlDate).toString()) {
      return;
    }
    throw new Error(UNEXPECTED_ERROR_MESSAGE(expected.type, expected, actual));
  }

  if (expected.type === 'time-local') {
    if (TOML.TomlDate.ofLocalTime(expected.value).toString() === (actual as TOML.TomlDate).toString()) {
      return;
    }
    throw new Error(UNEXPECTED_ERROR_MESSAGE(expected.type, expected, actual));
  }
}
