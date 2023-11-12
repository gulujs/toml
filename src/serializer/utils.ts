import { KeyPath, ObjectPath } from '@gulujs/object-path';
import { Key } from './schema.js';

export function stringifyKey(key: Key, keyPath: KeyPath): string {
  if (typeof key === 'string') {
    return key;
  } else if (Array.isArray(key)) {
    return keyPath.stringify(key);
  } else {
    throw new Error(`Invalid key "${key}"`);
  }
}

export function flattenPath(path: Array<Key | number>): Array<string | number> {
  let keys: Array<string | number> = [];
  for (const key of path) {
    if (Array.isArray(key)) {
      keys = [...keys, ...key];
    } else if (typeof key === 'number') {
      keys.push(key);
    } else {
      keys = [...keys, ...ObjectPath.quoteStyle.keyPath.parse(key)];
    }
  }
  return keys;
}
