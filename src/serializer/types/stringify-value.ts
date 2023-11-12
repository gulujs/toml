import { ObjectPath } from '@gulujs/object-path';
import {
  AnySchema,
  Key,
  KeyValueSchema,
  Schema,
  SchemaType,
  SerializeFn,
  SimpleSchemaType,
  SplitFn
} from '../schema.js';
import { serializeAny, BREAK } from './any.js';
import { assertIsArray, serializeArray } from './array.js';
import { assertIsBoolean, serializeBoolean } from './boolean.js';
import { assertIsDateTime, serializeDateTime } from './datetime.js';
import { assertIsFloat, serializeFloat } from './float.js';
import { assertIsInlineTable, serializeInlineTable } from './inline-table.js';
import { assertIsInteger, serializeInteger } from './integer.js';
import { assertIsString, serializeString } from './string.js';
import { stringifyKey } from '../utils.js';
import { Converter } from '../../converter/index.js';


export type GlobalSplitFn = (value: string, path: Array<string | number>) => string[];

export interface StringifyValueOptions {
  simpleMode?: boolean;
  topLevel: boolean;
  objectPath: ObjectPath;
  newline: '\n' | '\r\n';
  treatFunctionAsObject?: boolean;
  preferQuote: "'" | '"';

  preferOneLineString?: boolean;
  escapeTabChar?: boolean;
  globalStringSplitter?: GlobalSplitFn;
  schemaStringSplitters?: Record<string, SplitFn>;

  integerConverter: Converter<unknown>;
  floatConverter: Converter<unknown>;
  datetimeConverter: Converter<unknown>;

  strict?: boolean;
}

type AssertorFn = (value: any, options: StringifyValueOptions, path: Array<Key | number>) => void;
type SerializerFn = (value: any, schema: any, options: StringifyValueOptions, path: Array<Key | number>) => string;

export const valueAssertors: {
  [key in SimpleSchemaType]: AssertorFn;
} = {
  [SchemaType.String]: assertIsString,
  [SchemaType.Integer]: assertIsInteger,
  [SchemaType.Float]: assertIsFloat,
  [SchemaType.Boolean]: assertIsBoolean,
  [SchemaType.DateTime]: assertIsDateTime,
  [SchemaType.Array]: assertIsArray,
  [SchemaType.InlineTable]: assertIsInlineTable
};

export const valueSerializers: {
  [key in SimpleSchemaType]: SerializerFn;
} = {
  [SchemaType.String]: serializeString,
  [SchemaType.Integer]: serializeInteger,
  [SchemaType.Float]: serializeFloat,
  [SchemaType.Boolean]: serializeBoolean,
  [SchemaType.DateTime]: serializeDateTime,
  [SchemaType.Array]: serializeArray,
  [SchemaType.InlineTable]: serializeInlineTable
};

export function serializeSimpleTypeValue(
  value: unknown,
  schema: Exclude<KeyValueSchema, AnySchema>,
  options: StringifyValueOptions,
  path: Array<Key | number>
): string {
  let serializedValue: string;
  const serialize = (schema as { serialize?: SerializeFn; }).serialize;

  if (typeof serialize === 'function') {
    serializedValue = serialize(value);

  } else {
    if (options.simpleMode !== true) {
      valueAssertors[schema.type](value, options, path);
    }
    serializedValue = valueSerializers[schema.type](value, schema, options, path);
  }

  return serializedValue;
}

export function tryStringifyKeyValue(
  value: unknown,
  schema: Schema,
  options: StringifyValueOptions,
  path: Array<Key | number>,
  lines: string[]
): boolean {
  let serializedValue: string | null | typeof BREAK;

  switch (schema.type) {
    case SchemaType.Any:
      serializedValue = serializeAny(value, schema, options, path);
      if (serializedValue === BREAK) {
        return false;
      }
      if (serializedValue !== null) {
        lines.push(`${stringifyKey(schema.key, options.objectPath.keyPath)} = ${serializedValue}`);
      }
      return true;
    case SchemaType.String:
    case SchemaType.Boolean:
    case SchemaType.Integer:
    case SchemaType.Float:
    case SchemaType.DateTime:
    case SchemaType.Array:
    case SchemaType.InlineTable:
      lines.push(`${stringifyKey(schema.key, options.objectPath.keyPath)} = ${serializeSimpleTypeValue(value, schema, options, path)}`);
      return true;
    default:
      return false;
  }
}
