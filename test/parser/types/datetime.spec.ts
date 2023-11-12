import { expect, describe, test } from 'vitest';
import { Source } from '../../../src/parser/source.js';
import { Converters, ValueResult } from '../../../src/parser/types/get-value.js';
import { getDatetime } from '../../../src/parser/types/datetime.js';
import {
  DateTimeType,
  DatetimeConverter,
  FloatConverter,
  IntegerConverter,
  TomlDate
} from '../../../src/index.js';

function parseDatetime(str: string): ValueResult | null {
  const source = new Source(str);
  source.next();
  const converters: Converters = {
    integer: new IntegerConverter(),
    float: new FloatConverter(),
    datetime: new DatetimeConverter()
  };
  return getDatetime(source, 0, converters);
}

describe('parser - Date-Time', () => {
  test('parse Offset Date-Time', () => {
    const r = parseDatetime('2023-09-03T10:59:00.666+08:00');
    expect(r).toBeTruthy();

    const value = r!.value as TomlDate;
    expect(value.type).toBe(DateTimeType.OffsetDateTime);
    expect(value).toEqual(TomlDate.ofOffsetDateTime('2023-09-03T10:59:00.666+08:00'));
  });

  test('parse Local Date-Time', () => {
    const r = parseDatetime('2023-09-03T10:59:00.666');
    expect(r).toBeTruthy();

    const value = r!.value as TomlDate;
    expect(value.type).toBe(DateTimeType.LocalDateTime);
    expect(r!.value).toEqual(TomlDate.ofLocalDateTime('2023-09-03T10:59:00.666'));
  });

  test('parse Local Date', () => {
    const r = parseDatetime('2023-09-03');
    expect(r).toBeTruthy();

    const value = r!.value as TomlDate;
    expect(value.type).toBe(DateTimeType.LocalDate);
    expect(r!.value).toEqual(TomlDate.ofLocalDate('2023-09-03'));
  });

  test('parse Local Time', () => {
    const r = parseDatetime('10:59:00.666');
    expect(r).toBeTruthy();

    const value = r!.value as TomlDate;
    expect(value.type).toBe(DateTimeType.LocalTime);
    expect(r!.value).toEqual(TomlDate.ofLocalTime('10:59:00.666'));
  });
});
