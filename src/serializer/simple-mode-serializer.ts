import { ObjectPath, QuoteStyleKeyPath } from '@gulujs/object-path';
import {
  GlobalSplitFn,
  StringifyValueOptions,
  tryStringifyKeyValue
} from './types/index.js';
import {
  AnySchema,
  DecodedPath,
  SchemaType
} from './schema.js';
import {
  Converter,
  DatetimeConverter,
  FloatConverter,
  IntegerConverter
} from '../converter/index.js';


export interface SimpleModeSerializerOptions {
  newline?: '\n' | '\r\n';
  treatFunctionAsObject?: boolean;
  preferQuote?: "'" | '"';

  preferOneLineString?: boolean;
  escapeTabChar?: boolean;
  globalStringSplitter?: GlobalSplitFn;

  integerConverter?: Converter<unknown>;
  floatConverter?: Converter<unknown>;
  datetimeConverter?: Converter<unknown>;
}

export class SimpleModeSerializer {
  private readonly lines: string[] = [];
  private readonly objectPath: ObjectPath;
  private readonly newline: '\n' | '\r\n';
  private readonly treatFunctionAsObject?: boolean;
  private readonly integerConverter: Converter<unknown>;
  private readonly floatConverter: Converter<unknown>;
  private readonly datetimeConverter: Converter<unknown>;
  private readonly options: StringifyValueOptions;

  constructor(private readonly obj: Record<string, unknown>, options?: SimpleModeSerializerOptions) {
    this.objectPath = new ObjectPath({
      keyPath: new QuoteStyleKeyPath(options)
    });
    this.newline = options?.newline || '\n';
    this.treatFunctionAsObject = options?.treatFunctionAsObject;

    this.integerConverter = options?.integerConverter || new IntegerConverter();
    this.floatConverter = options?.floatConverter || new FloatConverter();
    this.datetimeConverter = options?.datetimeConverter || new DatetimeConverter();

    this.options = {
      simpleMode: true,
      topLevel: true,
      objectPath: this.objectPath,
      newline: this.newline,
      treatFunctionAsObject: this.treatFunctionAsObject,
      preferQuote: options?.preferQuote || "'",
      preferOneLineString: options?.preferOneLineString,
      escapeTabChar: options?.escapeTabChar,
      globalStringSplitter: options?.globalStringSplitter,
      integerConverter: this.integerConverter,
      floatConverter: this.floatConverter,
      datetimeConverter: this.datetimeConverter
    };
  }

  serialize(): string {
    this.serializeInSimpleMode(this.obj, []);

    return this.lines.join(this.newline);
  }

  private serializeInSimpleMode(
    obj: Record<string, unknown>,
    path: string[],
    isArrayOfTables = false
  ): void {
    if (path.length > 0) {
      if (this.lines.length > 0) {
        this.lines.push('');
      }
      this.lines.push(`${isArrayOfTables ? '[[' : '['}${this.objectPath.keyPath.stringify(path)}${isArrayOfTables ? ']]' : ']'}`);
    }
    const numOfLines = this.lines.length;

    const keys = Object.keys(obj);
    const restKeys = [];

    for (const key of keys) {
      const value = obj[key];
      const valuePath: DecodedPath = [key];
      const schema: AnySchema = {
        type: SchemaType.Any,
        key: valuePath
      };

      if (tryStringifyKeyValue(value, schema, this.options, [valuePath], this.lines)) {
        continue;
      }

      if (Array.isArray(value) && !this.isArrayOfTables(value)) {
        tryStringifyKeyValue(
          value,
          {
            type: SchemaType.Array,
            key: valuePath,
            items: SchemaType.Any
          },
          this.options,
          [valuePath],
          this.lines
        );
        continue;
      }

      restKeys.push(key);
    }

    if (numOfLines === this.lines.length && numOfLines > 0 && restKeys.length > 0 && !isArrayOfTables) {
      this.lines.pop();
      this.lines.pop();
    }

    for (const key of restKeys) {
      const value = obj[key];
      const valuePath = [...path, key];

      if (!Array.isArray(value)) {
        this.serializeInSimpleMode(value as Record<string, unknown>, valuePath);
        continue;
      }

      for (let i = 0; i < value.length; i++) {
        this.serializeInSimpleMode(value[i] as Record<string, unknown>, valuePath, true);
      }
    }
  }

  private isArrayOfTables(value: unknown[]): boolean {
    if (value.length === 0) {
      return false;
    }

    for (let i = 0; i < value.length; i++) {
      switch (typeof value[i]) {
        case 'string':
        case 'number':
        case 'bigint':
        case 'boolean':
        case 'symbol':
        case 'undefined':
          return false;
        case 'function':
          if (this.treatFunctionAsObject) {
            continue;
          }
          return false;
        default:
      }
      if (this.integerConverter.isJsValue(value[i])) {
        return false;
      }
      if (this.floatConverter.isJsValue(value[i])) {
        return false;
      }
      if (value[i] === null) {
        return false;
      }
      if (this.datetimeConverter.isJsValue(value[i])) {
        return false;
      }
      if (Array.isArray(value[i])) {
        return false;
      }
    }

    return true;
  }
}
