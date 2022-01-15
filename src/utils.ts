import {
  ESCAPE_CHARACTER_MAP,
  RE_ESCAPE_CHARACTER,
  RE_INVALID_CHARACTER,
  RE_WHITESPACE_OR_COMMENT
} from './constants.js';
import {
  InvalidCharacterError,
  InvalidEscapeCodesError,
  INVALID_CHARACTER_MESSAGE,
  INVALID_ESCAPE_CODES_MESSAGE,
  SYNTAX_ERROR_MESSAGE
} from './errors/index.js';
import { KeyResult } from './interfaces.js';
import { Source } from './source.js';


export function assertWhitespaceOrComment(source: Source, offset: number): void {
  RE_WHITESPACE_OR_COMMENT.lastIndex = offset;
  const matches = RE_WHITESPACE_OR_COMMENT.exec(source.line);
  if (!matches || matches.index !== offset) {
    throw new SyntaxError(SYNTAX_ERROR_MESSAGE(source, offset));
  }

  if (matches[2]) {
    assertValidString(matches[2], source, offset + matches[1]!.length + 1);
  }
}

export function assertValidString(str: string, source: Source, offset: number): void {
  RE_INVALID_CHARACTER.lastIndex = 0;
  const matches = RE_INVALID_CHARACTER.exec(str);
  if (!matches) {
    return;
  }

  throw new InvalidCharacterError(INVALID_CHARACTER_MESSAGE(source, offset + matches.index));
}

export function getKey(source: Source, offset: number, re: RegExp): KeyResult | null {
  const path: string[] = [];

  re.lastIndex = offset;
  let matches = re.exec(source.line);

  while (matches && matches.index === offset) {
    if (matches[2]) {
      path.push(matches[2]);
    } else if (typeof matches[3] !== 'undefined') {
      path.push(matches[3]);
    } else if (typeof matches[4] !== 'undefined') {
      path.push(unescapeString(matches[4], source, matches[1]!.length + 1));
    }

    if (matches[5]) {
      return {
        path,
        nextIndex: re.lastIndex
      };
    }

    offset = re.lastIndex;
    matches = re.exec(source.line);
  }

  return null;
}

export function unescapeString(str: string, source: Source, offset: number): string {
  return str.replace(RE_ESCAPE_CHARACTER, (match: string, u1: string | undefined, u2: string | undefined, matchOffset: number): string => {
    if (u1) {
      const code = parseInt(u1, 16);
      if ((0 <= code && code <= 0xD7FF) || (0xE000 <= code && code <= 0x10FFFF)) {
        return String.fromCharCode(code);
      }

    } else if (u2) {
      const code = parseInt(u2, 16);
      if ((0 <= code && code <= 0xD7FF) || (0xE000 <= code && code <= 0x10FFFF)) {
        return String.fromCharCode(code);
      }

    } else {
      const c = ESCAPE_CHARACTER_MAP[match];
      if (c) {
        return c;
      }
    }

    throw new InvalidEscapeCodesError(INVALID_ESCAPE_CODES_MESSAGE(match, source, offset + matchOffset));
  });
}
