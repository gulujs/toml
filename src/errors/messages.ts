import { ObjectPath } from '@gulujs/object-path';
import { Source } from '../source.js';

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
      message += ` in table [${ObjectPath.quoteStyle.keyPath.stringify(tablePath)}]`;
    } else {
      message += ` in table array [[${ObjectPath.quoteStyle.keyPath.stringify(tablePath)}]]`;
    }
  } else {
    message += ' in global';
  }
  return message;
};

export const DUPLICATE_TABLE_NAME_MESSAGE = (path: string[]): string => {
  return `The name of table [${ObjectPath.quoteStyle.keyPath.stringify(path)}] is duplicated`;
};

export const TABLE_NAME_IS_DECLARED_AS_KEY_MESSAGE = (path: string[]): string => {
  return `The name of table [${ObjectPath.quoteStyle.keyPath.stringify(path)}] is already declared as key`;
};

export const TABLE_NAME_IS_DECLARED_AS_TABLE_ARRAY_MESSAGE = (path: string[]): string => {
  return `The name of table [${ObjectPath.quoteStyle.keyPath.stringify(path)}] is already declared as table array`;
};

export const TABLE_ARRAY_NAME_IS_DECLARED_AS_OTHER_TYPE_MESSAGE = (path: string[]): string => {
  return `The name of table array [[${ObjectPath.quoteStyle.keyPath.stringify(path)}]] is already declared as other type`;
};

export const TABLE_ARRAY_NAME_IS_DECLARED_AS_KEY_MESSAGE = (path: string[]): string => {
  return `The name of table array [[${ObjectPath.quoteStyle.keyPath.stringify(path)}]] is already declared as key`;
};

export const KEY_IS_NOT_ALLOWED_TO_ADD_TO_TABLE_MESSAGE = (path: string[], tablePath: string[], index: number): string => {
  return `The key ${ObjectPath.quoteStyle.keyPath.stringify(path)}`
    + ` in table [${ObjectPath.quoteStyle.keyPath.stringify(tablePath)}]`
    + ` to add to [${ObjectPath.quoteStyle.keyPath.stringify([...tablePath, ...path.slice(0, index + 1)])}]`
    + ' after explicitly defining it above is not allowed';
};

export const FAILED_TO_ACCESS_AS_TABLE_MESSAGE = (path: string[], index: number, tablePath: string[] | null, isTableArray: boolean): string => {
  let message = `When define key ${ObjectPath.quoteStyle.keyPath.stringify(path)}`;
  if (tablePath) {
    if (!isTableArray) {
      message += ` in table [${ObjectPath.quoteStyle.keyPath.stringify(tablePath)}]`;
    } else {
      message += ` in table array [[${ObjectPath.quoteStyle.keyPath.stringify(tablePath)}]]`;
    }
  } else {
    message += ' in global';
  }

  return `${message}, that failed to access ${ObjectPath.quoteStyle.keyPath.stringify(path.slice(0, index + 1))} as table`;
};
