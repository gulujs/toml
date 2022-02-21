import { Source } from './source.js';
import { Parser } from './parser.js';
import { ParserOptions } from './interfaces.js';


export { Time } from './time.js';
export { InvalidCharacterError } from './errors/invalid-character-error.js';
export { InvalidEscapeCodesError } from './errors/invalid-escape-codes-error.js';
export { InvalidValueError } from './errors/invalid-value-error.js';
export { TableObjectError } from './errors/table-object-error.js';
export { getTableComment } from './utils.js';

export function parse<T = Record<string, unknown>>(source: string, options?: ParserOptions): T {
  const parser = new Parser(new Source(source), options);
  return parser.parse() as T;
}
