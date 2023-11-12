import { DecodedPath, ObjectPath } from '@gulujs/object-path';
import { Source } from '../parser/index.js';
import { Key } from '../serializer/index.js';
import { flattenPath } from '../serializer/utils.js';

export const PRETTY_ERROR_MESSAGE = (message: string, source: Source, offset: number): string => {
  return `${message} at row ${source.lineNum}, col ${offset + 1}`;
};

export const SYNTAX_ERROR_MESSAGE = (source: Source, offset: number): string => {
  return `Unexpected token in TOML at row ${source.lineNum}, col ${offset + 1}`;
};

export const INVALID_CHARACTER_MESSAGE = (source: Source, offset: number): string => {
  return `Invalid character 0x${source.line.charCodeAt(offset).toString(16)} in TOML at row ${source.lineNum}, col ${offset + 1}`;
};

export const INVALID_INTEGER_MESSAGE = (integer: string): string => {
  return `Invalid integer ${integer} in TOML`;
};

export const INVALID_DATETIME_MESSAGE = (datetime: string): string => {
  return `Invalid datetime ${datetime} in TOML`;
};

export const INVALID_TIME_MESSAGE = (time: string): string => {
  return `Invalid time ${time} in TOML`;
};

export const INVALID_ESCAPE_CODES_MESSAGE = (code: string, source: Source, offset: number): string => {
  return `Invalid escape codes ${code} in TOML at row ${source.lineNum}, col ${offset + 1}`;
};

export const DUPLICATE_KEY_MESSAGE = (path: string[], tablePath: string[] | null, isTableArray: boolean): string => {
  let message = `The key ${ObjectPath.quoteStyle.keyPath.stringify(path)} is duplicated`;
  if (tablePath) {
    if (!isTableArray) {
      message += ` in Table [${ObjectPath.quoteStyle.keyPath.stringify(tablePath)}]`;
    } else {
      message += ` in "Array of Tables" [[${ObjectPath.quoteStyle.keyPath.stringify(tablePath)}]]`;
    }
  } else {
    message += ' in global';
  }
  return message;
};

// invalid/table/duplicate.toml
// invalid/table/duplicate-key-dotted-table.toml
// invalid/table/duplicate-key-dotted-table2.toml
export const DUPLICATE_TABLE_NAME_MESSAGE = (path: string[]): string => {
  return `The name of Table [${ObjectPath.quoteStyle.keyPath.stringify(path)}] is duplicated.
Since tables cannot be defined more than once, redefining such tables using a [table] header is not allowed.
Likewise, using dotted keys to redefine tables already defined in [table] form is not allowed.`;
};

// invalid/inline-table/add.toml
export const TABLE_NAME_IS_ALREADY_DECLARED_AS_NON_TABLE_MESSAGE = (path: string[], index: number, isArrayTable = false): string => {
  let message = `The key ${ObjectPath.quoteStyle.keyPath.stringify(path.slice(0, index + 1))} is already declared as non-table type when define`;
  if (!isArrayTable) {
    message += ` Table [${ObjectPath.quoteStyle.keyPath.stringify(path)}]`;
  } else {
    message += ` "Array of Tables" [[${ObjectPath.quoteStyle.keyPath.stringify(path)}]]`;
  }
  return message;
};

export const TABLE_NAME_IS_DECLARED_AS_ARRAY_OF_TABLES_MESSAGE = (path: string[]): string => {
  return `The name of Table [${ObjectPath.quoteStyle.keyPath.stringify(path)}] is already declared as "Array of Tables"`;
};

export const ARRAY_OF_TABLES_NAME_IS_DECLARED_AS_OTHER_TYPE_MESSAGE = (path: string[]): string => {
  return `The name of "Array of Tables" [[${ObjectPath.quoteStyle.keyPath.stringify(path)}]] is already declared as other type`;
};

export const ARRAY_OF_TABLES_NAME_IS_DECLARED_AS_KEY_MESSAGE = (path: string[]): string => {
  return `The name of "Array of Tables" [[${ObjectPath.quoteStyle.keyPath.stringify(path)}]] is already declared as key`;
};

// invalid/table/append-with-dotted-keys-1.toml
// invalid/table/append-to-array-with-dotted-keys.toml
export const KEY_IS_NOT_ALLOWED_TO_ADD_TO_TABLE_MESSAGE = (path: string[], tablePath: string[], index: number, isTableArray: boolean): string => {
  let message = `The key ${ObjectPath.quoteStyle.keyPath.stringify(path)}`
    + ` in Table [${ObjectPath.quoteStyle.keyPath.stringify(tablePath)}]`;
  if (!isTableArray) {
    message += ` to add to [${ObjectPath.quoteStyle.keyPath.stringify([...tablePath, ...path.slice(0, index + 1)])}]`;
  } else {
    message += ` to add to [[${ObjectPath.quoteStyle.keyPath.stringify([...tablePath, ...path.slice(0, index + 1)])}]]`;
  }
  return `${message} after explicitly defining it above is not allowed`;
};

// invalid/key/dotted-redefine-table.toml
export const FAILED_TO_ACCESS_AS_TABLE_MESSAGE = (path: string[], index: number, tablePath: string[] | null, isTableArray: boolean): string => {
  let message = `When define key ${ObjectPath.quoteStyle.keyPath.stringify(path)}`;
  if (tablePath) {
    if (!isTableArray) {
      message += ` in Table [${ObjectPath.quoteStyle.keyPath.stringify(tablePath)}]`;
    } else {
      message += ` in "Array of Tables" [[${ObjectPath.quoteStyle.keyPath.stringify(tablePath)}]]`;
    }
  } else {
    message += ' in global';
  }

  return `${message}, that failed to access ${ObjectPath.quoteStyle.keyPath.stringify(path.slice(0, index + 1))} as table`;
};

// invalid/array/extending-table.toml
export const CANNOT_EXTEND_TABLES_WITHIN_STATIC_ARRAYS_MESSAGE = (path: string[], index: number): string => {
  return `Cannot extend Table [${ObjectPath.quoteStyle.keyPath.stringify(path)}] within static arrays ${ObjectPath.quoteStyle.keyPath.stringify(path.slice(0, index + 1))}`;
};

export const SCHEMA_TYPE_NOT_IN_RANGE_ERROR_MESSAGE = (path: DecodedPath, type: string, supportedTypes: string[]): string => {
  return `\`${ObjectPath.quoteStyle.keyPath.stringify(path)}\` The \`type\` "${type}" must be a valid value for (${supportedTypes.join(', ')}).`;
};

export const TYPE_ERROR_MESSAGE = (path: Array<Key | number>, msg: string): string => {
  const keys = flattenPath(path);
  const fullPathKey = ObjectPath.quoteStyle.keyPath.stringify(keys);
  return `\`${fullPathKey}\` ${msg}`;
};
