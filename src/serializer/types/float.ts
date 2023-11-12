import { TYPE_ERROR_MESSAGE } from '../../errors/index.js';
import { FloatSchema, Key } from '../schema.js';
import { StringifyValueOptions } from './stringify-value.js';

export function assertIsFloat(
  value: unknown,
  options: StringifyValueOptions,
  path: Array<Key | number>
): void {
  if (options.floatConverter.isJsValue(value)) {
    return;
  }
  throw new TypeError(TYPE_ERROR_MESSAGE(path, 'is not a float'));
}

export function serializeFloat(
  value: unknown,
  _schema: FloatSchema,
  options: StringifyValueOptions
): string {
  return options.floatConverter.convertJsValueToString(value);
}
