import { TYPE_ERROR_MESSAGE } from '../../errors/index.js';
import { BooleanSchema, Key } from '../schema.js';
import { StringifyValueOptions } from './stringify-value.js';

export function assertIsBoolean(
  value: unknown,
  _options: StringifyValueOptions,
  path: Array<Key | number>
): void {
  if (typeof value === 'boolean') {
    return;
  }
  throw new TypeError(TYPE_ERROR_MESSAGE(path, 'is not a boolean'));
}

export function serializeBoolean(value: unknown, _schema: BooleanSchema, _options: StringifyValueOptions): string {
  return String(value);
}
