import { TYPE_ERROR_MESSAGE } from '../../errors/index.js';
import { Key, TableSchema } from '../schema.js';
import { StringifyValueOptions, tryStringifyKeyValue } from './stringify-value.js';
import { stringifyKey } from '../utils.js';

export function assertIsTable(
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

export function serializeTable(
  obj: unknown,
  schema: TableSchema,
  options: StringifyValueOptions,
  path: Array<Key | number>
): string {
  const lines: string[] = [`[${stringifyKey(schema.key, options.objectPath.keyPath)}]`];

  for (let i = 0; i < schema.items.length; i++) {
    const itemSchema = schema.items[i]!;
    const value = options.objectPath.get(obj, itemSchema.key);
    if (typeof value === 'undefined' || value === null) {
      if (!options.strict) {
        continue;
      }
    }

    tryStringifyKeyValue(value, itemSchema, options, [...path, itemSchema.key], lines);
  }

  return lines.join(options.newline);
}
