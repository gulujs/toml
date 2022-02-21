import { Source } from './source.js';
import {
  RE_ARRAY_TABLE_KEY,
  RE_FIRST_CHARACTER,
  RE_KEY,
  RE_TABLE_KEY
} from './constants.js';
import { assertWhitespaceOrComment, getKey } from './utils.js';
import { tryGetValue } from './types/index.js';
import { ConvertorFactory } from './convertor.js';
import { TableObject } from './table-object.js';
import { Convertor, ParserOptions } from './interfaces.js';
import { SYNTAX_ERROR_MESSAGE } from './errors/index.js';


export class Parser {
  convertor: Convertor;
  obj: TableObject;

  constructor(public source: Source, options?: ParserOptions) {
    this.convertor = ConvertorFactory.create(options);
    this.obj = new TableObject(options);
  }

  parse(): Record<string, unknown> {
    while (this.source.next()) {
      if (this.source.line === '') {
        break;
      }

      RE_FIRST_CHARACTER.lastIndex = 0;
      const matches = RE_FIRST_CHARACTER.exec(this.source.line);
      if (!matches) {
        throw new SyntaxError(SYNTAX_ERROR_MESSAGE(this.source, 0));
      }

      if (matches[1]) {
        this.handleKeyValue();
        continue;
      }
      if (matches[2]) {
        this.handleTable(RE_FIRST_CHARACTER.lastIndex);
        continue;
      }
      if (matches[3]) {
        this.handleTableArray(RE_FIRST_CHARACTER.lastIndex);
        continue;
      }
      if (matches[4]) {
        this.handleComment();
        continue;
      }
      if (this.obj.enableTableComment) {
        this.obj.clearComments();
      }
    }

    return this.obj.root;
  }

  handleKeyValue(): void {
    const key = getKey(this.source, 0, RE_KEY);
    if (!key) {
      throw new SyntaxError(SYNTAX_ERROR_MESSAGE(this.source, 0));
    }

    const valueResult = tryGetValue(this.source, key.nextIndex, this.convertor);
    if (valueResult === null) {
      throw new SyntaxError(SYNTAX_ERROR_MESSAGE(this.source, key.nextIndex));
    }

    assertWhitespaceOrComment(this.source, valueResult.nextIndex);
    this.obj.set(key.path, valueResult.value);
  }

  handleTable(start: number): void {
    const key = getKey(this.source, start, RE_TABLE_KEY);
    if (!key) {
      throw new SyntaxError(SYNTAX_ERROR_MESSAGE(this.source, start));
    }

    assertWhitespaceOrComment(this.source, key.nextIndex);
    this.obj.switchTable(key.path);
  }

  handleTableArray(start: number): void {
    const key = getKey(this.source, start, RE_ARRAY_TABLE_KEY);
    if (!key) {
      throw new SyntaxError(SYNTAX_ERROR_MESSAGE(this.source, start));
    }

    assertWhitespaceOrComment(this.source, key.nextIndex);
    this.obj.switchTableArray(key.path);
  }

  handleComment(): void {
    const comment = assertWhitespaceOrComment(this.source, 0);
    if (this.obj.enableTableComment) {
      if (typeof comment === 'undefined') {
        this.obj.clearComments();
      } else {
        this.obj.addComment(comment);
      }
    }
  }
}
