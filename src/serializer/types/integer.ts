import { TYPE_ERROR_MESSAGE } from '../../errors/index.js';
import { IntegerSchema, Key } from '../schema.js';
import { StringifyValueOptions } from './stringify-value.js';

export function assertIsInteger(
  value: unknown,
  options: StringifyValueOptions,
  path: Array<Key | number>
): void {
  if (options.integerConverter.isJsValue(value)) {
    return;
  }
  throw new TypeError(TYPE_ERROR_MESSAGE(path, 'is not an integer'));
}

export function serializeInteger(
  value: unknown,
  schema: IntegerSchema,
  options: StringifyValueOptions
): string {
  return options.integerConverter.convertJsValueToString(value, { radix: schema.radix || 10 });
}
