/* eslint-disable */
import { Transform } from 'node:stream';
import * as TOML from '../dist/index.js';

class Encode extends Transform {
  constructor() {
    super({ encoding: 'utf-8' });
    this.str = '';
  }

  _transform(chunk, _encoding, callback) {
    this.str += chunk;
    callback();
  }

  _flush(callback) {
    try {
      const obj = this.convertToJsObject(JSON.parse(this.str));
      this.push(TOML.stringify(obj));
      callback();
    } catch (e) {
      callback(e);
    }
  }

  convertToJsObject(taggedObj) {
    if (Array.isArray(taggedObj)) {
      return taggedObj.map(it => this.convertToJsObject(it));
    }

    const keys = Object.keys(taggedObj);
    if (keys.length !== 2 || !['type', 'value'].every(key => keys.includes(key))) {
      return keys.reduce((obj, key) => (obj[key] = this.convertToJsObject(taggedObj[key]), obj), {});
    }

    switch (taggedObj.type) {
			case 'string':
				return taggedObj.value;
			case 'bool':
				return taggedObj.value === 'true'
			case 'integer':
				return BigInt(taggedObj.value)
			case 'float':
        if (/^[+-]?nan$/i.test(taggedObj.value)) {
          return Number.NaN;
        }
        if (/^\+?inf$/i.test(taggedObj.value)) {
          return Number.POSITIVE_INFINITY;
        }
        if (/^-inf$/i.test(taggedObj.value)) {
          return Number.NEGATIVE_INFINITY;
        }
				return Number(taggedObj.value)
			case 'datetime':
        return TOML.TomlDate.ofOffsetDateTime(taggedObj.value);
			case 'datetime-local':
        return TOML.TomlDate.ofLocalDateTime(taggedObj.value);
			case 'date-local':
        return TOML.TomlDate.ofLocalDate(taggedObj.value);
			case 'time-local':
				return TOML.TomlDate.ofLocalTime(taggedObj.value);
      default:
		    throw new Error(`Not support tagged object type '${taggedObj.type}'`);
    }
  }
}

process.stdin.pipe(new Encode()).pipe(process.stdout);
