import { TYPE_ERROR_MESSAGE } from '../../errors/index.js';
import { InlineTableSchema, Key, SchemaType } from '../schema.js';
import { StringifyValueOptions, tryStringifyKeyValue } from './stringify-value.js';

export function assertIsInlineTable(
  value: unknown,
  options: StringifyValueOptions,
  path: Array<Key | number>
): void {
  if (
    (typeof value === 'object' && value !== null)
    || (typeof value === 'function' && options.treatFunctionAsObject)
  ) {
    return;
  }
  throw new TypeError(TYPE_ERROR_MESSAGE(path, 'is not an object'));
}

export function serializeInlineTable(
  obj: Record<string, unknown>,
  schema: InlineTableSchema,
  options: StringifyValueOptions,
  path: Array<Key | number>
): string {
  const keyValuePairs: string[] = [];

  const propertyOptions: StringifyValueOptions = {
    ...options,
    topLevel: false
  };

  if (schema.items === SchemaType.Any) {
    const keys = Object.keys(obj);

    for (const key of keys) {
      const value = obj[key];
      if (typeof value === 'undefined' || value === null) {
        continue;
      }

      tryStringifyKeyValue(
        value,
        {
          type: SchemaType.Any,
          key: [key]
        },
        propertyOptions,
        [...path, key],
        keyValuePairs
      );
    }

  } else {
    for (let i = 0; i < schema.items.length; i++) {
      const propertySchema = schema.items[i]!;
      const value = options.objectPath.get(obj, propertySchema.key);
      if (typeof value === 'undefined' || value === null) {
        if (!options.strict) {
          continue;
        }
      }

      tryStringifyKeyValue(
        value,
        propertySchema,
        propertyOptions,
        [...path, propertySchema.key],
        keyValuePairs
      );
    }
  }

  return `{ ${keyValuePairs.join(', ')} }`;
}
