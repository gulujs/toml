import { TYPE_ERROR_MESSAGE } from '../../errors/index.js';
import { DateTimeSchema, Key } from '../schema.js';
import { StringifyValueOptions } from './stringify-value.js';

export function assertIsDateTime(
  value: unknown,
  options: StringifyValueOptions,
  path: Array<Key | number>
): void {
  if (options.datetimeConverter.isJsValue(value)) {
    return;
  }
  throw new TypeError(TYPE_ERROR_MESSAGE(path, 'is not a datetime'));
}

export function serializeDateTime(
  value: unknown,
  schema: DateTimeSchema,
  options: StringifyValueOptions
): string {
  return options.datetimeConverter.convertJsValueToString(value, { type: schema.dateTimeType });
}
