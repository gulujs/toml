export interface KeyResult {
  path: string[];
  nextIndex: number;
}

export interface ValueResult {
  value: unknown;
  nextIndex: number;
}

export type Sign = '' | '-' | '+';

export type BigIntConvertor = (
  radix: 10 | 16 | 8 | 2,
  sign: Sign,
  str: string
) => unknown;
export type DateTimeConvertor = (str: string) => unknown;
export type TimeConvertor = (str: string) => unknown;

export interface Convertor {
  bigint: BigIntConvertor;
  datetime: DateTimeConvertor;
  time: TimeConvertor;
}

export interface ConvertorOptions {
  /**
   * @default true
   */
  bigint?: boolean | BigIntConvertor;
  /**
   * @default 'Date'
   */
  datetime?: 'Dayjs' | 'Date' | DateTimeConvertor;
  time?: TimeConvertor;
}

export interface TableObjectOptions {
  enableTableComment?: boolean;
}

export type ParserOptions = ConvertorOptions & TableObjectOptions;
