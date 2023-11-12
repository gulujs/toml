export enum DateTimeType {
  OffsetDateTime = 'OffsetDateTime',
  LocalDateTime = 'LocalDateTime',
  LocalDate = 'LocalDate',
  LocalTime = 'LocalTime'
}

const KEY_TYPE = Symbol('KEY_TYPE');
const KEY_UTC_OFFSET = Symbol('KEY_UTC_OFFSET');

const RE_MATCH_UTC_OFFSET = /(?:[zZ]|(?:[-+]\d\d:\d\d))$/;
const RE_EXTRACT_OFFSET_PARTS = /([+-])(\d\d):?(\d\d)?/;

export class TomlDate extends Date {
  private [KEY_TYPE]: DateTimeType;
  private [KEY_UTC_OFFSET]: number;

  get type(): DateTimeType {
    return this[KEY_TYPE];
  }

  get utcOffset(): number {
    return this[KEY_UTC_OFFSET];
  }

  get isValid(): boolean {
    return !Number.isNaN(this.getTime());
  }

  private constructor(value: string | number | Date) {
    super(value);
    this[KEY_TYPE] = DateTimeType.LocalDateTime;
    this[KEY_UTC_OFFSET] = this.getTimezoneOffset() * -1;
  }

  static ofOffsetDateTime(value: string | number | Date, utcOffset?: string | number): TomlDate {
    const date = new TomlDate(value);
    date[KEY_TYPE] = DateTimeType.OffsetDateTime;

    if (typeof utcOffset === 'undefined' && typeof value === 'string') {
      const m = value.match(RE_MATCH_UTC_OFFSET);
      if (m) {
        if (m[0] === 'z' || m[0] === 'Z') {
          utcOffset = 0;
        } else {
          utcOffset = m[0];
        }
      }
    }

    const offset = typeof utcOffset === 'string' ? offsetFromString(utcOffset) : utcOffset;
    if (typeof offset === 'number') {
      date[KEY_UTC_OFFSET] = Math.abs(offset) <= 16 ? offset * 60 : offset;
    }

    return date;
  }

  static ofLocalDateTime(value: string | number | Date): TomlDate {
    const date = new TomlDate(value);
    date[KEY_TYPE] = DateTimeType.LocalDateTime;
    return date;
  }

  static ofLocalDate(value: string | number | Date): TomlDate {
    const date = new TomlDate(value);
    date[KEY_TYPE] = DateTimeType.LocalDate;
    return date;
  }

  static ofLocalTime(value: string | number | Date): TomlDate {
    if (typeof value === 'string') {
      value = `1970-01-01T${value}`;
    }
    const date = new TomlDate(value);
    date[KEY_TYPE] = DateTimeType.LocalTime;
    return date;
  }

  override toString(): string {
    switch (this.type) {
      case DateTimeType.OffsetDateTime:
        return this.toOffsetDateTimeString();
      case DateTimeType.LocalDateTime:
        return this.toLocalDateTimeString();
      case DateTimeType.LocalDate:
        return this.toLocalDateString();
      case DateTimeType.LocalTime:
        return this.toLocalTimeString();
      default:
        throw new RangeError('The `type` must be a valid value for `DateTimeType`');
    }
  }

  toOffsetDateTimeString(): string {
    return new Date(this.getTime() + (this.utcOffset * 60 * 1000)).toISOString().replace(/Z$/, padZoneStr(this.utcOffset));
  }

  toLocalDateTimeString(): string {
    return `${this.toLocalDateString()}T${this.toLocalTimeString()}`;
  }

  toLocalDateString(): string {
    return `${padStart(this.getFullYear(), 4, '0')}-${padStart(this.getMonth() + 1, 2, '0')}-${padStart(this.getDate(), 2, '0')}`;
  }

  toLocalTimeString(): string {
    return `${padStart(this.getHours(), 2, '0')}:${padStart(this.getMinutes(), 2, '0')}:${padStart(this.getSeconds(), 2, '0')}.${padStart(this.getMilliseconds(), 3, '0')}`;
  }
}

function padStart(str: string | number, len: number, pad: string): string {
  const s = String(str);
  if (s.length >= len) {
    return s;
  }
  return `${Array((len + 1) - s.length).join(pad)}${str}`;
}

function padZoneStr(offset: number): string {
  if (offset === 0) {
    return 'Z';
  }
  const negMinutes = -offset;
  const minutes = Math.abs(negMinutes);
  const hourOffset = Math.floor(minutes / 60);
  const minuteOffset = minutes % 60;
  return `${negMinutes <= 0 ? '+' : '-'}${padStart(hourOffset, 2, '0')}:${padStart(minuteOffset, 2, '0')}`;
}

function offsetFromString(value: string): number | null {
  const m = value.match(RE_EXTRACT_OFFSET_PARTS);
  if (!m) {
    return null;
  }

  const totalOffsetInMinutes = (Number(m[2]) * 60) + Number(m[3] || 0);
  if (totalOffsetInMinutes === 0) {
    return 0;
  }

  return m[1] === '-' ? -totalOffsetInMinutes : totalOffsetInMinutes;
}
