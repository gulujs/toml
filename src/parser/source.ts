import {
  INVALID_CHARACTER_MESSAGE,
  INVALID_ESCAPE_CODES_MESSAGE,
  SYNTAX_ERROR_MESSAGE
} from '../errors/index.js';
import {
  ESCAPE_CHARACTER_MAP,
  RE_ESCAPE_CHARACTER,
  RE_INVALID_CHARACTER_WITHOUT_REPLACEMENT_CHARACTER,
  RE_INVALID_CHARACTER_WITH_REPLACEMENT_CHARACTER,
  RE_WHITESPACE_OR_COMMENT
} from './constants.js';

export interface KeyResult {
  path: string[];
  nextIndex: number;
}

export interface SourceOptions {
  disableCheckReplacementCharacter?: boolean;
}

export class Source {
  private nextPos = 0;
  private end = false;
  private readonly disableCheckReplacementCharacter: boolean;
  private readonly RE_INVALID_CHARACTER = RE_INVALID_CHARACTER_WITH_REPLACEMENT_CHARACTER;

  lineNum = 0;
  line = '';

  constructor(private readonly source: string, options?: SourceOptions) {
    this.disableCheckReplacementCharacter = !!options?.disableCheckReplacementCharacter;
    if (this.disableCheckReplacementCharacter) {
      this.RE_INVALID_CHARACTER = RE_INVALID_CHARACTER_WITHOUT_REPLACEMENT_CHARACTER;
    }
  }

  next(): boolean {
    if (this.end) {
      return false;
    }

    const start = this.nextPos;
    const i = this.source.indexOf('\n', start);

    this.lineNum++;

    if (i >= 0) {
      this.nextPos = i + 1;
    } else {
      this.nextPos = this.source.length;
      this.end = true;
    }

    this.line = this.source.substring(start, this.nextPos);
    return true;
  }

  assertWhitespaceOrComment(offset: number): string | undefined {
    RE_WHITESPACE_OR_COMMENT.lastIndex = offset;
    const matches = RE_WHITESPACE_OR_COMMENT.exec(this.line);
    if (!matches || matches.index !== offset) {
      throw new SyntaxError(SYNTAX_ERROR_MESSAGE(this, offset));
    }

    if (matches[2]) {
      this.assertValidString(matches[2], offset + matches[1]!.length + 1);
    }
    return matches[2];
  }

  assertValidString(str: string, offset: number): void {
    this.RE_INVALID_CHARACTER.lastIndex = 0;
    const matches = this.RE_INVALID_CHARACTER.exec(str);
    if (!matches) {
      return;
    }

    throw new SyntaxError(INVALID_CHARACTER_MESSAGE(this, offset + matches.index));
  }

  getKey(offset: number, re: RegExp): KeyResult | null {
    const path: string[] = [];

    re.lastIndex = offset;
    let matches = re.exec(this.line);

    while (matches && matches.index === offset) {
      if (matches[2]) {
        path.push(matches[2]);
      } else if (typeof matches[3] !== 'undefined') {
        path.push(matches[3]);
      } else if (typeof matches[4] !== 'undefined') {
        path.push(this.unescapeString(matches[4], matches[1]!.length + 1));
      }

      if (matches[5]) {
        return {
          path,
          nextIndex: re.lastIndex
        };
      }

      offset = re.lastIndex;
      matches = re.exec(this.line);
    }

    return null;
  }

  unescapeString(str: string, offset: number): string {
    const replacer = (
      match: string,
      u1: string | undefined,
      u2: string | undefined,
      matchOffset: number
    ): string => {
      if (u1) {
        const code = parseInt(u1, 16);
        if ((0 <= code && code <= 0xD7FF) || (0xE000 <= code && code <= 0x10FFFF)) {
          return String.fromCodePoint(code);
        }

      } else if (u2) {
        const code = parseInt(u2, 16);
        if ((0 <= code && code <= 0xD7FF) || (0xE000 <= code && code <= 0x10FFFF)) {
          return String.fromCodePoint(code);
        }

      } else {
        const c = ESCAPE_CHARACTER_MAP[match];
        if (c) {
          return c;
        }
      }

      throw new SyntaxError(INVALID_ESCAPE_CODES_MESSAGE(match, this, offset + matchOffset));
    };

    return str.replace(RE_ESCAPE_CHARACTER, replacer);
  }
}
