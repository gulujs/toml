import { Dayjs } from 'dayjs';
import { RE_DATETIME } from '../constants.js';
import { InvalidValueError, PRETTY_ERROR_MESSAGE } from '../errors/index.js';
import { Convertor, ValueResult } from '../interfaces.js';
import { Source } from '../source.js';
import { Time } from '../time.js';


export function getDatetime(source: Source, offset: number, convertor: Convertor): ValueResult | null {
  RE_DATETIME.lastIndex = offset;
  const matches = RE_DATETIME.exec(source.line);
  if (!matches || matches.index !== offset) {
    return null;
  }

  let value!: Date | Dayjs | Time | unknown;
  try {
    if (matches[2]) {
      value = convertor.datetime(matches[2]);
    } else if (matches[3]) {
      value = convertor.time(matches[3]);
    }
  } catch (e) {
    if (e instanceof InvalidValueError) {
      e.message = PRETTY_ERROR_MESSAGE(e.message, source, offset + matches[1]!.length);
    }
    throw e;
  }

  return {
    value,
    nextIndex: RE_DATETIME.lastIndex
  };
}
