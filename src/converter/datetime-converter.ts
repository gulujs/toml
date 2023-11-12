import { Converter } from './converter.js';
import { INVALID_DATETIME_MESSAGE, InvalidValueError } from '../errors/index.js';
import { DateTimeType, TomlDate } from '../date.js';


export interface DatetimeConverterOptions {
  /**
   * Used in the `convertJsValueToString` method.
   */
  defaultDateTimeType?: DateTimeType;
  /**
   * Used in the `convertJsValueToString` method.
   * Only useful when the type is `OffsetDateTime`.
   */
  utcOffset?: number | string;
}

interface DateLike {
  valueOf(): number;
}

export class DatetimeConverter implements Converter<TomlDate> {
  defaultDateTimeType: DateTimeType;
  utcOffset?: number | string;

  constructor(options?: DatetimeConverterOptions) {
    this.defaultDateTimeType = options?.defaultDateTimeType || DateTimeType.LocalDateTime;
    this.utcOffset = options?.utcOffset;
  }

  convertStringToJsValue(str: string, options: { type: DateTimeType; }): TomlDate {
    let date: TomlDate;
    switch (options.type) {
      case DateTimeType.OffsetDateTime:
        date = TomlDate.ofOffsetDateTime(str);
        break;
      case DateTimeType.LocalDateTime:
        date = TomlDate.ofLocalDateTime(str);
        break;
      case DateTimeType.LocalDate:
        date = TomlDate.ofLocalDate(str);
        break;
      case DateTimeType.LocalTime:
        date = TomlDate.ofLocalTime(str);
        break;
      default:
        throw new RangeError('The `type` must be a valid value for `DateTimeType`');
    }

    if (!date.isValid) {
      throw new InvalidValueError(INVALID_DATETIME_MESSAGE(str));
    }

    return date;
  }

  isJsValue(value: unknown): boolean {
    return value instanceof Date;
  }

  convertJsValueToString(value: Date | DateLike, options: { type?: DateTimeType; }): string {
    const type = options.type || this.defaultDateTimeType;

    if (value instanceof TomlDate) {
      return value.toString();
    }

    let rawDate: Date | number | undefined;
    if (value instanceof Date) {
      rawDate = value;
    } else if (this.isDateLike(value)) {
      rawDate = value.valueOf();
    }
    if (typeof rawDate !== 'undefined') {
      let date: TomlDate;
      switch (type) {
        case DateTimeType.OffsetDateTime:
          date = TomlDate.ofOffsetDateTime(rawDate, this.utcOffset);
          break;
        case DateTimeType.LocalDateTime:
          date = TomlDate.ofLocalDateTime(rawDate);
          break;
        case DateTimeType.LocalDate:
          date = TomlDate.ofLocalDate(rawDate);
          break;
        case DateTimeType.LocalTime:
          date = TomlDate.ofLocalTime(rawDate);
          break;
        default:
          throw new RangeError('The `type` must be a valid value for `DateTimeType`');

      }
      return date.toString();
    }

    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    throw new TypeError(`DateTime "${value}" is not an expected value`);
  }

  private isDateLike(value: unknown): value is DateLike {
    return !!value && typeof value.valueOf === 'function';
  }
}
