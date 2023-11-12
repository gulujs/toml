import { Source } from './source.js';
import {
  RE_ARRAY_TABLE_KEY,
  RE_FIRST_CHARACTER,
  RE_KEY,
  RE_TABLE_KEY
} from './constants.js';
import { Converters, tryGetValue } from './types/index.js';
import { TableObject, TableObjectOptions } from '../table-object/index.js';
import { SYNTAX_ERROR_MESSAGE } from '../errors/index.js';
import {
  Converter,
  DatetimeConverter,
  FloatConverter,
  IntegerConverter
} from '../converter/index.js';

export interface ParserOptions extends TableObjectOptions {
  integerConverter?: Converter<unknown>;
  floatConverter?: Converter<unknown>;
  datetimeConverter?: Converter<unknown>;
  /**
   * https://stackoverflow.com/a/3527176
   *
   * @default false
   */
  disableCheckReplacementCharacter?: boolean;
}

export class Parser {
  converters: Converters;
  obj: TableObject;

  constructor(public source: Source, options?: ParserOptions) {
    this.converters = {
      integer: options?.integerConverter || new IntegerConverter(),
      float: options?.floatConverter || new FloatConverter(),
      datetime: options?.datetimeConverter || new DatetimeConverter()
    };
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
    const key = this.source.getKey(0, RE_KEY);
    if (!key) {
      throw new SyntaxError(SYNTAX_ERROR_MESSAGE(this.source, 0));
    }

    const valueResult = tryGetValue(this.source, key.nextIndex, this.converters);
    if (valueResult === null) {
      throw new SyntaxError(SYNTAX_ERROR_MESSAGE(this.source, key.nextIndex));
    }

    this.source.assertWhitespaceOrComment(valueResult.nextIndex);
    this.obj.set(key.path, valueResult.value);
  }

  handleTable(start: number): void {
    const key = this.source.getKey(start, RE_TABLE_KEY);
    if (!key) {
      throw new SyntaxError(SYNTAX_ERROR_MESSAGE(this.source, start));
    }

    this.source.assertWhitespaceOrComment(key.nextIndex);
    this.obj.switchTable(key.path);
  }

  handleTableArray(start: number): void {
    const key = this.source.getKey(start, RE_ARRAY_TABLE_KEY);
    if (!key) {
      throw new SyntaxError(SYNTAX_ERROR_MESSAGE(this.source, start));
    }

    this.source.assertWhitespaceOrComment(key.nextIndex);
    this.obj.switchArrayOfTables(key.path);
  }

  handleComment(): void {
    const comment = this.source.assertWhitespaceOrComment(0);
    if (this.obj.enableTableComment) {
      if (typeof comment === 'undefined') {
        this.obj.clearComments();
      } else {
        this.obj.addComment(comment);
      }
    }
  }
}
