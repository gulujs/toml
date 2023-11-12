/* eslint-disable */
import { Transform } from 'node:stream';
import * as TOML from '../dist/index.js';

class Decode extends Transform {
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
      const obj = TOML.parse(this.str);
      this.push(JSON.stringify(this.convertToTaggedObject(obj), null, 2));
      callback();
    } catch (e) {
      callback(e);
    }
  }

  convertToTaggedObject(obj) {
    if (typeof obj === 'string') {
      return { type: 'string', value: obj };
    }

    if (typeof obj === 'boolean') {
      return { type: 'bool', value: String(obj) };
    }

    if (typeof obj === 'number') {
      if (Number.isNaN(obj)) {
        return { type: 'float', value: 'nan' };
      }
      if (obj === Number.POSITIVE_INFINITY) {
        return { type: 'float', value: 'inf' };
      }
      if (obj === Number.NEGATIVE_INFINITY) {
        return { type: 'float', value: '-inf' };
      }
      if (Number.isInteger(obj)) {
        return { type: 'integer', value: String(obj) };
      } else {
        return { type: 'float', value: String(obj) };
      }
    }

    if (typeof obj === 'bigint') {
      return { type: 'integer', value: String(obj) };
    }

    if (obj instanceof TOML.TomlDate) {
      if (obj.type === 'OffsetDateTime') {
        return { type: 'datetime', value: obj.toString() };
      }
      if (obj.type === 'LocalDateTime' ) {
        return { type: 'datetime-local', value: obj.toString() };
      }
      if (obj.type === 'LocalDate' ) {
        return { type: 'date-local', value: obj.toString() };
      }
      if (obj.type === 'LocalTime' ) {
        return { type: 'time-local', value: obj.toString() };
      }
    }

    if (Array.isArray(obj)) {
      return obj.map(it => this.convertToTaggedObject(it));
    }

    return Object.keys(obj)
      .reduce((r, key) => {
        r[key] = this.convertToTaggedObject(obj[key]);
        return r;
      }, {});
  }
}

process.stdin.pipe(new Decode()).pipe(process.stdout);
