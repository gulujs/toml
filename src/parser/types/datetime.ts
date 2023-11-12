import { RE_DATETIME } from '../constants.js';
import {
  INVALID_DATETIME_MESSAGE,
  InvalidValueError,
  PRETTY_ERROR_MESSAGE
} from '../../errors/index.js';
import { Source } from '../source.js';
import { Converters, ValueResult } from './get-value.js';
import { DateTimeType } from '../../date.js';


export function getDatetime(source: Source, offset: number, converters: Converters): ValueResult | null {
  RE_DATETIME.lastIndex = offset;
  const matches = RE_DATETIME.exec(source.line);
  if (!matches || matches.index !== offset) {
    return null;
  }

  let value: unknown;
  try {
    if (matches[2]) {
      let type = DateTimeType.LocalDate;
      if (matches[5]) {
        type = DateTimeType.OffsetDateTime;
      } else if (matches[3]) {
        type = DateTimeType.LocalDateTime;
      }

      if (matches[4] && matches[4] > '23') {
        throw new InvalidValueError(INVALID_DATETIME_MESSAGE(matches[2]));
      }

      value = converters.datetime.convertStringToJsValue(matches[2], { type });

    } else if (matches[6]) {
      value = converters.datetime.convertStringToJsValue(matches[6], { type: DateTimeType.LocalTime });
    }
  } catch (e) {
    if (e instanceof Error) {
      e.message = PRETTY_ERROR_MESSAGE(e.message, source, offset + matches[1]!.length);
    }
    throw e;
  }

  return {
    value,
    nextIndex: RE_DATETIME.lastIndex
  };
}
