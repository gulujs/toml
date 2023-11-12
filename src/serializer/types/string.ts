import { TYPE_ERROR_MESSAGE } from '../../errors/index.js';
import { Key, StringSchema } from '../schema.js';
import { flattenPath } from '../utils.js';
import { StringifyValueOptions } from './stringify-value.js';


const RE_ONE_SINGLE_QUOTE_AND_CTRL_CHAR_INCLUDE_TAB_CHAR = /[\u0000-\u001F\u007F']/;
const RE_ONE_SINGLE_QUOTE_AND_CTRL_CHAR_EXCLUDE_TAB_CHAR = /[\u0000-\u0008\u000A-\u001F\u007F']/;

const RE_THREE_SINGLE_QUOTE_AND_CTRL_CHAR_INCLUDE_TAB_CHAR = /[\u0000-\u0009\u000B\u000C\u000E-\u001F\u007F]|(?:\r(?!\n))|'''/;
const RE_THREE_SINGLE_QUOTE_AND_CTRL_CHAR_EXCLUDE_TAB_CHAR = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]|(?:\r(?!\n))|'''/;

const RE_ONE_DOUBLE_QUOTE_REPLACE_PATTERN_INCLUDE_TAB_CHAR = /[\u0000-\u001F\u007F"\\]/g;
const RE_ONE_DOUBLE_QUOTE_REPLACE_PATTERN_EXCLUDE_TAB_CHAR = /[\u0000-\u0008\u000A-\u001F\u007F"\\]/g;

const RE_THREE_DOUBLE_QUOTE_REPLACE_PATTERN_INCLUDE_TAB_CHAR = /[\u0000-\u0009\u000B\u000C\u000E-\u001F\u007F\\]|(\r(?!\n))|"""|\\/g;
const RE_THREE_DOUBLE_QUOTE_REPLACE_PATTERN_EXCLUDE_TAB_CHAR = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F\\]|(\r(?!\n))|"""|\\/g;

const RE_ONE_SINGLE_QUOTE_AND_CTRL_CHAR: Record<'true' | 'false', RegExp> = {
  true: RE_ONE_SINGLE_QUOTE_AND_CTRL_CHAR_INCLUDE_TAB_CHAR,
  false: RE_ONE_SINGLE_QUOTE_AND_CTRL_CHAR_EXCLUDE_TAB_CHAR
};
const RE_THREE_SINGLE_QUOTE_AND_CTRL_CHAR: Record<'true' | 'false', RegExp> = {
  true: RE_THREE_SINGLE_QUOTE_AND_CTRL_CHAR_INCLUDE_TAB_CHAR,
  false: RE_THREE_SINGLE_QUOTE_AND_CTRL_CHAR_EXCLUDE_TAB_CHAR
};
const RE_ONE_DOUBLE_QUOTE_REPLACE_PATTERN: Record<'true' | 'false', RegExp> = {
  true: RE_ONE_DOUBLE_QUOTE_REPLACE_PATTERN_INCLUDE_TAB_CHAR,
  false: RE_ONE_DOUBLE_QUOTE_REPLACE_PATTERN_EXCLUDE_TAB_CHAR
};
const RE_THREE_DOUBLE_QUOTE_REPLACE_PATTERN: Record<'true' | 'false', RegExp> = {
  true: RE_THREE_DOUBLE_QUOTE_REPLACE_PATTERN_INCLUDE_TAB_CHAR,
  false: RE_THREE_DOUBLE_QUOTE_REPLACE_PATTERN_EXCLUDE_TAB_CHAR
};

const ENCODE_CHAR_MAP: Record<string, string> = {
  '\b': '\\b',
  '\t': '\\t',
  '\n': '\\n',
  '\f': '\\f',
  '\r': '\\r',
  '"': '\\"',
  '"""': '""\\"',
  '\\': '\\\\',
  '\u007F': '\\u007F'
};
for (let i = 0; i <= 0x1F; i++) {
  const char = String.fromCodePoint(i);
  if (ENCODE_CHAR_MAP[char]) {
    continue;
  }
  ENCODE_CHAR_MAP[char] = `\\u${`000${i.toString(16)}`.toUpperCase().slice(-4)}`;
}

export function assertIsString(
  value: unknown,
  _options: StringifyValueOptions,
  path: Array<Key | number>
): void {
  if (typeof value === 'string') {
    return;
  }
  throw new TypeError(TYPE_ERROR_MESSAGE(path, 'is not a string'));
}

export function serializeString(
  raw: string,
  schema: StringSchema,
  options: StringifyValueOptions,
  path: Array<Key | number>
): string {
  const escapeTabChar = !!options.escapeTabChar as unknown as 'true' | 'false';

  let lines: string[];
  let split = schema.split;

  if (typeof schema.split === 'string' && options.schemaStringSplitters) {
    split = options.schemaStringSplitters[schema.split];
  }

  if (typeof split === 'function') {
    lines = split(raw);
  } else if (!split && typeof options.globalStringSplitter === 'function') {
    lines = options.globalStringSplitter(raw, flattenPath(path));
  } else {
    lines = [raw];
  }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!lines || lines.length === 0) {
    return "''";
  }

  if (lines.length === 1) {
    if (options.preferOneLineString || !raw.includes('\n')) {
      if (options.preferQuote === '\'' && !RE_ONE_SINGLE_QUOTE_AND_CTRL_CHAR[escapeTabChar].test(lines[0]!)) {
        return `'${lines[0]!}'`;
      }

      return `"${lines[0]!.replace(RE_ONE_DOUBLE_QUOTE_REPLACE_PATTERN[escapeTabChar], replacer)}"`;
    }

    if (options.preferQuote === '\'' && !RE_THREE_SINGLE_QUOTE_AND_CTRL_CHAR[escapeTabChar].test(lines[0]!)) {
      return `'''${options.newline}${lines[0]}'''`;
    }

    return `"""\n${lines[0]!.replace(RE_THREE_DOUBLE_QUOTE_REPLACE_PATTERN[escapeTabChar], replacer)}"""`;
  }

  const str = lines.map(line => `${line.replace(RE_THREE_DOUBLE_QUOTE_REPLACE_PATTERN[escapeTabChar], replacer)}\\`)
    .join(options.newline);

  return `"""${options.newline}${str}${options.newline}"""`;
}

function replacer(match: string): string {
  return ENCODE_CHAR_MAP[match]!;
}
