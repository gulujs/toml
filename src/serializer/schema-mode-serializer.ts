import { ObjectPath, QuoteStyleKeyPath } from '@gulujs/object-path';
import {
  assertIsArrayOfTables,
  assertIsTable,
  serializeArrayOfTables,
  serializeTable,
  StringifyValueOptions,
  tryStringifyKeyValue
} from './types/index.js';
import { Schema, SchemaType, SplitFn } from './schema.js';
import { SchemaValidator } from './schema-validator.js';
import { TYPE_ERROR_MESSAGE } from '../errors/index.js';
import { SimpleModeSerializerOptions } from './simple-mode-serializer.js';
import {
  DatetimeConverter,
  FloatConverter,
  IntegerConverter
} from '../converter/index.js';


export interface SchemaModeSerializerOptions extends SimpleModeSerializerOptions {
  schemata: Schema[];
  disableCheckSchema?: boolean;
  schemaStringSplitters?: Record<string, SplitFn>;
  strict?: boolean;
}

export class SchemaModeSerializer {
  private readonly lines: string[] = [];
  private readonly schemata: Schema[];
  private readonly disableCheckSchema: boolean;
  private readonly objectPath: ObjectPath;
  private readonly newline: '\n' | '\r\n';
  private readonly treatFunctionAsObject?: boolean;
  private readonly strict?: boolean;
  private readonly options: StringifyValueOptions;

  constructor(private readonly obj: Record<string, unknown>, options: SchemaModeSerializerOptions) {
    this.schemata = options.schemata;
    this.disableCheckSchema = options.disableCheckSchema === true;

    this.objectPath = new ObjectPath({
      keyPath: new QuoteStyleKeyPath(options)
    });
    this.newline = options.newline || '\n';
    this.treatFunctionAsObject = options.treatFunctionAsObject;
    this.strict = options.strict;

    this.options = {
      simpleMode: false,
      topLevel: true,
      objectPath: this.objectPath,
      newline: this.newline,
      treatFunctionAsObject: this.treatFunctionAsObject,
      preferQuote: options.preferQuote || "'",
      preferOneLineString: options.preferOneLineString,
      escapeTabChar: options.escapeTabChar,
      schemaStringSplitters: options.schemaStringSplitters,
      integerConverter: options.integerConverter || new IntegerConverter(),
      floatConverter: options.floatConverter || new FloatConverter(),
      datetimeConverter: options.datetimeConverter || new DatetimeConverter(),
      strict: this.strict
    };
  }

  serialize(): string {
    this.serializeInSchemaMode(this.obj, this.schemata);

    return this.lines.join(this.newline);
  }

  private serializeInSchemaMode(obj: Record<string, unknown>, schemata: Schema[]): void {
    if (!this.disableCheckSchema) {
      const validator = new SchemaValidator(schemata);
      validator.validate();
    }

    for (let i = 0; i < schemata.length; i++) {
      const schema = schemata[i]!;
      const value = this.objectPath.get(obj, schema.key);
      if (typeof value === 'undefined' || value === null) {
        if (!this.strict) {
          continue;
        }
      }

      const path = [schema.key];

      if (tryStringifyKeyValue(value, schema, this.options, path, this.lines)) {
        continue;
      }

      if (schema.type === SchemaType.Table) {
        assertIsTable(value, this.options, path);
        this.lines.push(serializeTable(value, schema, this.options, path));
        continue;
      }

      if (schema.type === SchemaType.ArrayOfTables) {
        assertIsArrayOfTables(value as unknown[], this.options, path);
        this.lines.push(serializeArrayOfTables(value as unknown[], schema, this.options, path));
        continue;
      }

      throw new TypeError(TYPE_ERROR_MESSAGE(path, `schema type "${schema.type}" is invalid`));
    }
  }
}
