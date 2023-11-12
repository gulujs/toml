import { Converter } from './converter.js';

export class FloatConverter implements Converter<number> {
  convertStringToJsValue(str: string): number {
    return Number.parseFloat(str);
  }

  isJsValue(value: unknown): boolean {
    return typeof value === 'number' && !Number.isInteger(value);
  }

  convertJsValueToString(value: number): string {
    if (Number.isFinite(value)) {
      return String(value);
    }
    if (Number.isNaN(value)) {
      return 'nan';
    }
    if (value === Number.POSITIVE_INFINITY) {
      return 'inf';
    }
    return '-inf';
  }
}
