import { TYPE_ERROR_MESSAGE } from '../../errors/index.js';
import { stringifyKey } from '../utils.js';
import { ArrayOfTablesSchema, Key } from '../schema.js';
import { StringifyValueOptions, tryStringifyKeyValue } from './stringify-value.js';
import { assertIsTable } from './table.js';


export function assertIsArrayOfTables(
  value: unknown,
  _options: StringifyValueOptions,
  path: Array<Key | number>
): void {
  if (Array.isArray(value)) {
    return;
  }
  throw new TypeError(TYPE_ERROR_MESSAGE(path, 'is not an array'));
}

export function serializeArrayOfTables(
  arr: unknown[],
  schema: ArrayOfTablesSchema,
  options: StringifyValueOptions,
  path: Array<Key | number>
): string {
  const lines: string[] = [];

  for (let i = 0; i < arr.length; i++) {
    const obj = arr[i];
    assertIsTable(obj, options, path);

    lines.push(`[[${stringifyKey(schema.key, options.objectPath.keyPath)}]]`);

    for (let j = 0; j < schema.items.length; j++) {
      const itemSchema = schema.items[j]!;
      const value = options.objectPath.get(obj, itemSchema.key);
      if (typeof value === 'undefined' || value === null) {
        if (!options.strict) {
          continue;
        }
      }

      tryStringifyKeyValue(value, itemSchema, options, [...path, i, itemSchema.key], lines);
    }
    lines.push('');
  }

  return lines.join(options.newline);
}
