import {
  expect,
  describe,
  test,
  beforeEach
} from 'vitest';
import {
  Converter,
  DateTimeType,
  DatetimeConverter,
  FloatConverter,
  IntegerConverter,
  TomlDate
} from '../src/index.js';

describe('Converter', () => {
  describe('Integer', () => {
    let converter: Converter<number | bigint>;

    beforeEach(() => {
      converter = new IntegerConverter();
    });

    test('convertStringToJsValue less than or equal to Number.MAX_SAFE_INTEGER', () => {
      expect(converter.convertStringToJsValue('42', { sign: '-', radix: 10 })).toBe(-42);
      expect(converter.convertStringToJsValue('2A', { sign: '', radix: 16 })).toBe(42);
      expect(converter.convertStringToJsValue('52', { sign: '', radix: 8 })).toBe(42);
      expect(converter.convertStringToJsValue('101010', { sign: '', radix: 2 })).toBe(42);
    });

    test('convertStringToJsValue greater than Number.MAX_SAFE_INTEGER', () => {
      expect(converter.convertStringToJsValue('424242424242424242', { sign: '-', radix: 10 })).toBe(-424242424242424242n);
      expect(converter.convertStringToJsValue('5E3363CB39EC9B2', { sign: '', radix: 16 })).toBe(424242424242424242n);
      expect(converter.convertStringToJsValue('27431543626347544662', { sign: '', radix: 8 })).toBe(424242424242424242n);
      expect(converter.convertStringToJsValue('10111100011001101100011110010110011100111101100100110110010', { sign: '', radix: 2 })).toBe(424242424242424242n);
    });

    test('isJsValue', () => {
      expect(converter.isJsValue(42)).toBe(true);
      expect(converter.isJsValue(42n)).toBe(true);
      expect(converter.isJsValue('42')).toBe(false);
      expect(converter.isJsValue({})).toBe(false);
      expect(converter.isJsValue(true)).toBe(false);
    });

    test('convertJsValueToString', () => {
      expect(converter.convertJsValueToString(-42, { radix: 10 })).toBe('-42');
      expect(() => converter.convertJsValueToString(-42, { radix: 16 })).toThrowError('Negative number should only be allowed in decimal representation');
      expect(converter.convertJsValueToString(42, { radix: 16 })).toBe('0x2a');
      expect(converter.convertJsValueToString(42, { radix: 8 })).toBe('0o52');
      expect(converter.convertJsValueToString(42, { radix: 2 })).toBe('0b101010');
    });
  });

  describe('Float', () => {
    let converter: Converter<number>;

    beforeEach(() => {
      converter = new FloatConverter();
    });

    test('convertStringToJsValue', () => {
      expect(converter.convertStringToJsValue('0.42')).toBe(0.42);
    });

    test('isJsValue', () => {
      expect(converter.isJsValue(0.42)).toBe(true);
      expect(converter.isJsValue(42)).toBe(false);
      expect(converter.isJsValue('42')).toBe(false);
    });

    test('convertJsValueToString', () => {
      expect(converter.convertJsValueToString(0.42)).toBe('0.42');
    });
  });

  describe('DateTime', () => {
    let converter: Converter<TomlDate>;

    beforeEach(() => {
      converter = new DatetimeConverter();
    });

    test('convertStringToJsValue', () => {
      expect(converter.convertStringToJsValue('2020-10-24T10:24:00.1024+08:00', { type: DateTimeType.OffsetDateTime })).toEqual(TomlDate.ofOffsetDateTime('2020-10-24T10:24:00.1024+08:00'));
      expect(converter.convertStringToJsValue('2020-10-24T10:24:00.1024', { type: DateTimeType.LocalDateTime })).toEqual(TomlDate.ofLocalDateTime('2020-10-24T10:24:00.1024'));
      expect(converter.convertStringToJsValue('2020-10-24', { type: DateTimeType.LocalDate })).toEqual(TomlDate.ofLocalDate('2020-10-24'));
      expect(converter.convertStringToJsValue('10:24:00', { type: DateTimeType.LocalTime })).toEqual(TomlDate.ofLocalTime('10:24:00'));
    });

    test('isJsValue', () => {
      expect(converter.isJsValue(new Date())).toBe(true);
      expect(converter.isJsValue(TomlDate.ofOffsetDateTime('2020-10-24T10:24:00.1024+08:00'))).toBe(true);
      expect(converter.isJsValue(null)).toBe(false);
      expect(converter.isJsValue(undefined)).toBe(false);
      expect(converter.isJsValue(42)).toBe(false);
    });

    test('convertJsValueToString', () => {
      expect(converter.convertJsValueToString(TomlDate.ofOffsetDateTime('2023-08-29T06:00:00.000+08:00'), {})).toBe('2023-08-29T06:00:00.000+08:00');
      expect(converter.convertJsValueToString(TomlDate.ofLocalDateTime('2023-08-29T06:00:00.000'), {})).toBe('2023-08-29T06:00:00.000');
      expect(converter.convertJsValueToString(TomlDate.ofLocalDate('2023-08-29'), {})).toBe('2023-08-29');
      expect(converter.convertJsValueToString(TomlDate.ofLocalTime('06:00:00'), {})).toBe('06:00:00.000');
    });
  });
});
