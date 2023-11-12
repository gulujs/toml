import { TYPE_ERROR_MESSAGE } from '../../errors/index.js';
import {
  AnySchema,
  ArrayItemSchema,
  ArraySchema,
  Key,
  KeyValueSchema,
  SchemaType
} from '../schema.js';
import { assertIsAny, serializeAny } from './any.js';
import {
  serializeSimpleTypeValue,
  StringifyValueOptions,
  valueAssertors,
  valueSerializers
} from './stringify-value.js';


export function assertIsArray(
  value: unknown,
  _options: StringifyValueOptions,
  path: Array<Key | number>
): void {
  if (Array.isArray(value)) {
    return;
  }
  throw new TypeError(TYPE_ERROR_MESSAGE(path, 'is not an array'));
}

export function serializeArray(
  value: unknown[],
  schema: ArraySchema,
  options: StringifyValueOptions,
  path: Array<Key | number>
): string {
  switch (schema.items) {
    case SchemaType.Any:
      return serializeArrayByAnyType(
        value,
        { type: SchemaType.Any, key: '' },
        options,
        path
      );
    case SchemaType.String:
    case SchemaType.Integer:
    case SchemaType.Float:
    case SchemaType.Boolean:
      return serializeArrayBySimpleType(
        value,
        { type: schema.items, key: '' },
        options,
        path
      );
    default:
  }

  if (!Array.isArray(schema.items)) {
    if (schema.items.type === SchemaType.Any) {
      return serializeArrayByAnyType(
        value,
        { ...schema.items, key: '' },
        options,
        path
      );
    }

    return serializeArrayBySimpleType(
      value,
      { ...schema.items, key: '' },
      options,
      path
    );
  }

  return serializeArrayBySchemas(value, schema.items, options, path);
}

function serializeArrayByAnyType(
  arr: unknown[],
  schema: AnySchema,
  options: StringifyValueOptions,
  path: Array<Key | number>
): string {
  const elements: string[] = [];
  const itemOptions: StringifyValueOptions = {
    ...options,
    topLevel: false
  };

  for (let i = 0; i < arr.length; i++) {
    const itemPath = [...path, i];
    assertIsAny(arr[i], options, itemPath);
    elements.push(serializeAny(arr[i], schema, itemOptions, itemPath) as string);
  }

  if (options.topLevel) {
    return `[${options.newline}  ${elements.join(`,${options.newline}  `)}${options.newline}]`;
  } else {
    return `[${elements.join(', ')}]`;
  }
}

function serializeArrayBySimpleType(
  arr: unknown[],
  schema: Exclude<KeyValueSchema, AnySchema>,
  options: StringifyValueOptions,
  path: Array<Key | number>
): string {
  const elements: string[] = [];
  const itemOptions: StringifyValueOptions = {
    ...options,
    topLevel: false
  };

  const assert = valueAssertors[schema.type];
  const serialize = valueSerializers[schema.type];

  for (let i = 0; i < arr.length; i++) {
    const itemPath = [...path, i];
    assert(arr[i], options, itemPath);
    elements.push(serialize(arr[i], schema, itemOptions, itemPath));
  }

  if (options.topLevel) {
    return `[${options.newline}  ${elements.join(`,${options.newline}  `)}${options.newline}]`;
  } else {
    return `[${elements.join(', ')}]`;
  }
}

function serializeArrayBySchemas(
  arr: unknown[],
  schemas: ArrayItemSchema[],
  options: StringifyValueOptions,
  path: Array<Key | number>
): string {
  const elements: string[] = [];
  const itemOptions: StringifyValueOptions = {
    ...options,
    topLevel: false
  };

  for (let i = 0; i < schemas.length; i++) {
    const schema = schemas[i]!;
    const itemPath = [...path, i];
    switch (schema) {
      case SchemaType.Any:
        assertIsAny(arr[i], itemOptions, itemPath);
        elements.push(serializeAny(
          arr[i],
          { type: SchemaType.Any, key: '' },
          itemOptions,
          itemPath
        ) as string);
        continue;
      case SchemaType.String:
      case SchemaType.Integer:
      case SchemaType.Float:
      case SchemaType.Boolean:
        elements.push(serializeSimpleTypeValue(
          arr[i],
          { type: schema, key: '' },
          itemOptions,
          itemPath
        ));
        continue;
      default:
    }

    if (!Array.isArray(schema)) {
      if (schema.type === SchemaType.Any) {
        assertIsAny(arr[i], itemOptions, itemPath);
        elements.push(serializeAny(
          arr[i],
          { ...schema, key: '' },
          itemOptions,
          itemPath
        ) as string);
        continue;
      }

      elements.push(serializeSimpleTypeValue(
        arr[i],
        { ...schema, key: '' },
        itemOptions,
        itemPath
      ));
      continue;
    }

    assertIsArray(arr[i], itemOptions, itemPath);
    elements.push(serializeArrayBySchemas(arr[i] as unknown[], schema, itemOptions, itemPath));
  }

  if (options.topLevel) {
    return `[${options.newline}  ${elements.join(`,${options.newline}  `)}${options.newline}]`;
  } else {
    return `[${elements.join(', ')}]`;
  }
}
