import dayjs, { Dayjs } from 'dayjs';
import { INTEGER_PREFIX_MAP } from './constants.js';
import {
  InvalidValueError,
  INVALID_DATETIME_MESSAGE,
  INVALID_INTEGER_MESSAGE
} from './errors/index.js';
import {
  Convertor,
  ConvertorOptions,
  Sign
} from './interfaces.js';
import { Time } from './time.js';


function convertBigIntEnabled(
  radix: 10 | 16 | 8 | 2,
  sign: Sign,
  str: string
): BigInt {
  if (radix === 10) {
    return BigInt(`${sign}${str}`);
  } else {
    return BigInt(`${INTEGER_PREFIX_MAP[radix]}${str}`);
  }
}

function convertBigIntDisabled(
  radix: 10 | 16 | 8 | 2,
  sign: Sign,
  str: string
): never {
  throw new InvalidValueError(INVALID_INTEGER_MESSAGE(`${sign}${INTEGER_PREFIX_MAP[radix]}${str}`));
}

function convertDateTimeDate(str: string): Date {
  const datetime = dayjs(str);
  if (!datetime.isValid()) {
    throw new InvalidValueError(INVALID_DATETIME_MESSAGE(str));
  }
  return datetime.toDate();
}

function convertDateTimeDayjs(str: string): Dayjs {
  const datetime = dayjs(str);
  if (!datetime.isValid()) {
    throw new InvalidValueError(INVALID_DATETIME_MESSAGE(str));
  }
  return datetime;
}

function convertTime(str: string): Time {
  return new Time(str);
}

export class ConvertorFactory {
  static create(options?: ConvertorOptions): Convertor {
    const convertor: Convertor = {
      bigint: convertBigIntEnabled,
      datetime: convertDateTimeDate,
      time: convertTime
    };

    if (!options) {
      return convertor;
    }

    if (options.bigint === false) {
      convertor.bigint = convertBigIntDisabled;
    } else if (typeof options.bigint === 'function') {
      convertor.bigint = options.bigint;
    }

    if (options.datetime === 'Dayjs') {
      convertor.datetime = convertDateTimeDayjs;
    } else if (typeof options.datetime === 'function') {
      convertor.datetime = options.datetime;
    }

    if (typeof options.time === 'function') {
      convertor.time = options.time;
    }

    return convertor;
  }
}
