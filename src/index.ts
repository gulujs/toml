import { Source } from './source.js';
import { Parser } from './parser.js';
import { ParserOptions } from './interfaces.js';


export { Time } from './time.js';
export {
  InvalidCharacterError,
  InvalidEscapeCodesError,
  InvalidValueError,
  TableObjectError
} from './errors/index.js';
export { getTableComment } from './utils.js';

export function parse<T = Record<string, unknown>>(source: string, options?: ParserOptions): T {
  const parser = new Parser(new Source(source), options);
  return parser.parse() as T;
}
