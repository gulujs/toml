import { TYPE_ERROR_MESSAGE } from '../../errors/index.js';
import { AnySchema, Key, SchemaType } from '../schema.js';
import { serializeArray } from './array.js';
import { serializeBoolean } from './boolean.js';
import { serializeDateTime } from './datetime.js';
import { serializeFloat } from './float.js';
import { serializeInlineTable } from './inline-table.js';
import { serializeInteger } from './integer.js';
import { serializeString } from './string.js';
import { StringifyValueOptions } from './stringify-value.js';

export function assertIsAny(
  value: unknown,
  options: StringifyValueOptions,
  path: Array<Key | number>
): void {
  if (
    typeof value !== 'undefined'
    && value !== null
    && !(typeof value === 'function' && options.treatFunctionAsObject)
  ) {
    return;
  }
  throw new TypeError(TYPE_ERROR_MESSAGE(path, 'is an invalid value'));
}

export const BREAK = Symbol('BREAK');

export function serializeAny(
  value: unknown,
  schema: AnySchema,
  options: StringifyValueOptions,
  path: Array<Key | number>
): string | null | typeof BREAK {
  switch (typeof value) {
    case 'string':
      return serializeString(
        value,
        {
          ...schema,
          type: SchemaType.String
        },
        options,
        path
      );
    case 'boolean':
      return serializeBoolean(
        value,
        {
          ...schema,
          type: SchemaType.Boolean
        },
        options
      );
    case 'symbol':
    case 'undefined':
      return null;
    // @ts-expect-error fallthrough
    case 'function':
      if (!options.treatFunctionAsObject) {
        return null;
      }
      // fallthrough
    default:
  }

  if (value === null) {
    return null;
  }

  if (options.integerConverter.isJsValue(value)) {
    return serializeInteger(
      value,
      {
        ...schema,
        type: SchemaType.Integer
      },
      options
    );
  }

  if (options.floatConverter.isJsValue(value)) {
    return serializeFloat(
      value,
      {
        ...schema,
        type: SchemaType.Float
      },
      options
    );
  }

  if (options.datetimeConverter.isJsValue(value)) {
    return serializeDateTime(
      value,
      {
        ...schema,
        type: SchemaType.DateTime
      },
      options
    );
  }

  // In simple mode, Array and Object preferentially attempt to serialize as ArrayOfTables and Table.
  if (options.simpleMode && options.topLevel) {
    return BREAK;
  }

  if (Array.isArray(value)) {
    return serializeArray(
      value,
      {
        ...schema,
        type: SchemaType.Array,
        items: SchemaType.Any
      },
      options,
      path
    );
  }

  if (
    typeof value === 'object'
    || (typeof value === 'function' && options.treatFunctionAsObject)
  ) {
    return serializeInlineTable(
      value as Record<string, unknown>,
      {
        ...schema,
        type: SchemaType.InlineTable,
        items: SchemaType.Any
      },
      options,
      path
    );
  }

  throw new TypeError(TYPE_ERROR_MESSAGE(path, 'is not a valid value'));
}
